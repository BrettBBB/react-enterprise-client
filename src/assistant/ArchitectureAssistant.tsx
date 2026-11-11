import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import { useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { errorMessage } from "../api/client.ts";
import posthog, { isPostHogEnabled } from "../posthog.ts";
import { titleForPath } from "../shell/routes.ts";
import "./ArchitectureAssistant.css";
import { askArchitecture } from "./ask.ts";

const examples = [
  "How did Brett scale Compassion's messaging pipeline?",
  "What did the Prisma migration involve at Medi-Share?",
  "What did the client side React build involve at Medi-Share?",
] as const;

export function ArchitectureAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  async function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || pending) {
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setQuestion(trimmed);
    setAnswer("");
    setError(null);
    setPending(true);
    setOpen(true);
    try {
      await askArchitecture(
        trimmed,
        location.pathname,
        (text) => {
          setAnswer((current) => current + text);
        },
        controller.signal,
      );
      if (isPostHogEnabled) {
        posthog.capture("architecture_question_answered");
        posthog.logger.info("architecture assistant response completed", {
          response_type: "streamed",
        });
      }
    } catch (caught) {
      if (!controller.signal.aborted) {
        setError(
          errorMessage(caught, "The assistant could not answer that question."),
        );
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <>
      <button
        type="button"
        className="app-nav-item app-nav-group"
        aria-expanded={open}
        aria-controls="architecture-assistant"
        onClick={() => setOpen(true)}
      >
        <AutoAwesomeOutlinedIcon aria-hidden />
        <span className="app-nav-label">Ask AI about this Architecture</span>
      </button>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { className: "architecture-assistant-paper" } }}
      >
        <form
          id="architecture-assistant"
          className="architecture-assistant"
          onSubmit={submit}
        >
          <div className="architecture-assistant-heading">
            <h2 className="architecture-assistant-title">
              Ask AI about this Architecture
            </h2>
            <p className="architecture-assistant-copy text-secondary">
              Answers come from the case studies and the pages of this site.
              You are on {titleForPath(location.pathname)}.
            </p>
          </div>
          <TextField
            label="Question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about a case study"
            multiline
            minRows={3}
            fullWidth
            disabled={pending}
          />
          <div className="architecture-assistant-examples">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="architecture-assistant-example"
                disabled={pending}
                onClick={() => void ask(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            variant="contained"
            disabled={pending || question.trim().length === 0}
          >
            {pending ? "Answering…" : "Ask"}
          </Button>
          {error ? (
            <p className="architecture-assistant-error" role="alert">
              {error}
            </p>
          ) : null}
          {answer || pending ? (
            <p className="architecture-assistant-answer" role="status">
              {answer || "Answering…"}
            </p>
          ) : null}
        </form>
      </Drawer>
    </>
  );
}
