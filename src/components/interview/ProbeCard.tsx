import { useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  probe: string;
  onSubmit: (response: string) => void;
  submitting?: boolean;
}

export function ProbeCard({ probe, onSubmit, submitting }: Props) {
  const [value, setValue] = useState("");

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-8 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Interviewer Follow-Up
      </p>
      <p className="mt-3 text-[17px] leading-[1.7] text-foreground">{probe}</p>

      <p className="mt-5 flex items-start gap-2 text-xs italic leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Respond to the follow-up probe. Your answer will be re-evaluated to show whether your
          second attempt improved your weakest dimension.
        </span>
      </p>

      <div className="mt-8">
        <label htmlFor="probe-textarea" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Response
        </label>
        <textarea
          id="probe-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 2000))}
          placeholder="Respond as you would in the room…"
          className="mt-3 min-h-[180px] w-full resize-y rounded-xl border border-input bg-card p-5 text-[15px] leading-[1.7] text-foreground outline-none placeholder:text-muted-foreground/50 transition-all duration-200 focus-visible:border-primary focus-visible:shadow-soft focus-visible:ring-2 focus-visible:ring-primary/15"
          disabled={submitting}
        />
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {value.trim().length > 0 ? `${value.trim().length} chars` : ""}
          </p>
          <Button
            onClick={() => onSubmit(value.trim())}
            disabled={submitting || value.trim().length < 10}
            className="h-11 px-8 shadow-soft-sm transition-shadow hover:shadow-soft"
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating…</>
            ) : "Submit & Score"}
          </Button>
        </div>
      </div>
    </section>
  );
}
