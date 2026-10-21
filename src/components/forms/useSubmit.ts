"use client";
import { useState } from "react";
import { submitForm, formToObject } from "@/lib/forms";

export type Status = "idle" | "sending" | "sent" | "error";

export function useSubmit(formName: string, extra?: () => Record<string, string>) {
  const [status, setStatus] = useState<Status>("idle");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = formToObject(form);
    if (data["bot-field"]) return; // honeypot
    setStatus("sending");
    try {
      await submitForm(formName, { ...data, ...(extra ? extra() : {}) });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };
  return { status, onSubmit };
}
