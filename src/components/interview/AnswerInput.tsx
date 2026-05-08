import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Props {
  onSubmit: (answer: string, timeToAnswerSec: number) => void;
  disabled?: boolean;
}

const MIN_CHARS = 15;
const MAX_CHARS = 4000;

export function AnswerInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");
  const [startedAt] = useState(() => Date.now());
  const tooShort = value.trim().length < MIN_CHARS;

  const handleSubmit = () => {
    if (tooShort || disabled) return;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    onSubmit(value.trim(), elapsed);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-8 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <label htmlFor="answer-textarea" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Answer
        </label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {value.length} / {MAX_CHARS}
        </span>
      </div>
      <textarea
        id="answer-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Frame the problem first. Name a specific user segment. Make a reasoned choice and acknowledge what you are giving up…"
        className="min-h-[260px] w-full resize-y rounded-xl border border-input bg-background p-5 text-[15px] leading-[1.7] text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/15"
        disabled={disabled}
      />
      <div className="mt-6 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {tooShort
            ? `${MIN_CHARS - value.trim().length} more characters needed — good answers need depth.`
            : "✓ Ready to submit"}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={tooShort || disabled}
          className="h-11 shadow-soft-sm transition-shadow hover:shadow-soft sm:min-w-[200px]"
        >
          {disabled ? "Scoring…" : (
            <>
              Submit Answer <Send className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
