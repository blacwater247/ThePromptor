import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2 } from "lucide-react";

const Schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  comment: z.string().trim().min(1, "Please write a comment").max(2000),
});

type Status = "idle" | "submitting" | "success" | "error";

export function CommentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const parsed = Schema.safeParse({ name, email, comment });
    if (!parsed.success) {
      setStatus("error");
      setMessage(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/public/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setMessage("Thank you. Your comment has been submitted.");
      setName("");
      setEmail("");
      setComment("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-6 sm:p-8 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="comment-name">Name</Label>
        <Input
          id="comment-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          required
          disabled={status === "submitting"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment-email">Email</Label>
        <Input
          id="comment-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={255}
          required
          disabled={status === "submitting"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment-body">Comment</Label>
        <Textarea
          id="comment-body"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={5}
          maxLength={2000}
          required
          disabled={status === "submitting"}
        />
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="brand-gradient text-black font-semibold border-0 hover:opacity-90 w-full sm:w-auto"
      >
        {status === "submitting" ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Comment
          </>
        )}
      </Button>

      {status === "success" && (
        <p className="flex items-center gap-2 text-sm text-primary font-medium">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive font-medium">{message}</p>
      )}
    </form>
  );
}
