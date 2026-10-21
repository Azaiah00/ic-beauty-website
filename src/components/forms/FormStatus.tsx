import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Status } from "./useSubmit";

export function FormStatus({ status, sent, tone = "light" }: { status: Status; sent: string; tone?: "light" | "dark" }) {
  return (
    <div aria-live="polite" className="min-h-[1.5rem]">
      {status === "sent" && (
        <p className={`flex items-start gap-2 text-[0.95rem] ${tone === "dark" ? "text-brass-soft" : "text-plum-800"}`}>
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" aria-hidden="true" />
          {sent}
        </p>
      )}
      {status === "error" && (
        <p className="flex items-start gap-2 text-[0.95rem] text-[#b4533c]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          Something went wrong. Please call or text (804) 397-3340 or email icbeautyinyou@gmail.com.
        </p>
      )}
    </div>
  );
}
