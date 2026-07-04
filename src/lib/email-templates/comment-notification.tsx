import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  email?: string;
  comment?: string;
}

const CommentNotification = ({ name, email, comment }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New comment from {name || "a visitor"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New comment submitted</Heading>
        <Text style={muted}>A visitor left a comment on Blacure.</Text>
        <Hr style={hr} />
        <Section>
          <Text style={label}>Name</Text>
          <Text style={value}>{name || "—"}</Text>
          <Text style={label}>Email</Text>
          <Text style={value}>{email || "—"}</Text>
          <Text style={label}>Comment</Text>
          <Text style={{ ...value, whiteSpace: "pre-wrap" }}>{comment || "—"}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={muted}>Sent from thepromptor.life</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: CommentNotification,
  subject: (data: Record<string, any>) =>
    `New comment from ${data?.name || "a visitor"}`,
  displayName: "Comment notification",
  to: "Blacsam@Blacure.com",
  previewData: {
    name: "Jane Doe",
    email: "jane@example.com",
    comment: "Loving the prompts — keep it up!",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "32px 24px", maxWidth: "560px", margin: "0 auto" };
const h1 = { fontSize: "22px", color: "#111", margin: "0 0 8px" };
const muted = { fontSize: "13px", color: "#666", margin: "0 0 12px" };
const label = {
  fontSize: "12px",
  color: "#888",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "12px 0 4px",
};
const value = { fontSize: "15px", color: "#111", margin: "0 0 8px" };
const hr = { borderColor: "#eee", margin: "20px 0" };
