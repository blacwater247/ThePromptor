import * as React from "react";
import { render } from "react-email";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Blacure";
const SENDER_DOMAIN = "notify.thepromptor.life";
const FROM_DOMAIN = "thepromptor.life";

const CommentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  comment: z.string().trim().min(1).max(2000),
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/public/comment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let parsed;
        try {
          const body = await request.json();
          parsed = CommentSchema.parse(body);
        } catch {
          return Response.json({ error: "Invalid submission" }, { status: 400 });
        }

        const template = TEMPLATES["comment-notification"];
        if (!template) {
          return Response.json({ error: "Template unavailable" }, { status: 500 });
        }

        const recipient = template.to!;
        const messageId = crypto.randomUUID();
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Ensure unsubscribe token exists for recipient (required by dispatcher).
        const normalizedEmail = recipient.toLowerCase();
        let unsubscribeToken: string;
        const { data: existing } = await supabase
          .from("email_unsubscribe_tokens")
          .select("token")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (existing?.token) {
          unsubscribeToken = existing.token;
        } else {
          unsubscribeToken = generateToken();
          await supabase
            .from("email_unsubscribe_tokens")
            .upsert(
              { token: unsubscribeToken, email: normalizedEmail },
              { onConflict: "email", ignoreDuplicates: true },
            );
          const { data: stored } = await supabase
            .from("email_unsubscribe_tokens")
            .select("token")
            .eq("email", normalizedEmail)
            .maybeSingle();
          if (stored?.token) unsubscribeToken = stored.token;
        }

        const element = React.createElement(template.component, parsed);
        const html = await render(element);
        const text = await render(element, { plainText: true });
        const subject =
          typeof template.subject === "function"
            ? template.subject(parsed)
            : template.subject;

        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "comment-notification",
          recipient_email: recipient,
          status: "pending",
        });

        const { error: enqueueError } = await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: recipient,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text,
            reply_to: parsed.email,
            purpose: "transactional",
            label: "comment-notification",
            idempotency_key: messageId,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        });

        if (enqueueError) {
          console.error("Failed to enqueue comment email", enqueueError);
          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "comment-notification",
            recipient_email: recipient,
            status: "failed",
            error_message: "Failed to enqueue",
          });
          return Response.json({ error: "Failed to send" }, { status: 500 });
        }

        return Response.json({ success: true });
      },
    },
  },
});
