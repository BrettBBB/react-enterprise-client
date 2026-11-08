import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState, type SubmitEvent } from "react";
import { errorMessage } from "../api/client.ts";
import { useAuth } from "../auth/auth-context.ts";
import { sendContactMessage } from "./contact-api.ts";
import "./ContactPage.css";

const emptyMessage = {
  name: "",
  email: "",
  message: "",
};

export function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    ...emptyMessage,
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof emptyMessage, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSent(false);
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setSubmitting(true);
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setForm((current) => ({ ...current, message: "" }));
      setSent(true);
    } catch (caught) {
      setError(errorMessage(caught, "The message could not be sent"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack
      className="contact-page"
      component="form"
      spacing={2}
      onSubmit={onSubmit}
    >
      <p className="contact-lead text-secondary">
        Send a note about a role, a project, or a question.
        <br />
        <br />
      </p>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {sent ? <Alert severity="success">Message sent.</Alert> : null}
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={(event) => update("name", event.target.value)}
        required
        autoFocus
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Message"
        name="message"
        value={form.message}
        onChange={(event) => update("message", event.target.value)}
        required
        multiline
        minRows={6}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </Stack>
  );
}
