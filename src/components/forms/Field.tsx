type Base = { label: string; name: string; required?: boolean; hint?: string; tone?: "light" | "dark"; className?: string };

const box = (tone: "light" | "dark") =>
  `w-full rounded-xl border px-4 py-3.5 text-[1rem] outline-none transition focus:ring-2 ${
    tone === "dark"
      ? "border-lilac/20 bg-plum-900/60 text-bone placeholder:text-lilac/40 focus:border-brass focus:ring-brass/30"
      : "border-plum-800/15 bg-paper text-ink placeholder:text-plum-700/40 focus:border-amethyst focus:ring-amethyst/20"
  }`;

function Label({ label, required, hint, tone, htmlFor }: { label: string; required?: boolean; hint?: string; tone: "light" | "dark"; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 flex items-baseline justify-between gap-3 text-[0.88rem] font-medium ${tone === "dark" ? "text-lilac" : "text-plum-800"}`}>
      <span>
        {label}
        {required && <span aria-hidden="true" className="text-brass"> *</span>}
      </span>
      {hint && <span className="text-[0.75rem] font-normal opacity-85">{hint}</span>}
    </label>
  );
}

export function Input({ label, name, required, hint, tone = "light", className, type = "text", autoComplete, placeholder }: Base & { type?: string; autoComplete?: string; placeholder?: string }) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label label={label} required={required} hint={hint} tone={tone} htmlFor={id} />
      <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className={box(tone)} />
    </div>
  );
}

export function Select({ label, name, required, hint, tone = "light", className, options, defaultValue }: Base & { options: string[]; defaultValue?: string }) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label label={label} required={required} hint={hint} tone={tone} htmlFor={id} />
      <select id={id} name={name} required={required} defaultValue={defaultValue ?? ""} className={`${box(tone)} appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239b72b0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
        <option value="" disabled>
          Choose one
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({ label, name, required, hint, tone = "light", className, rows = 4, placeholder }: Base & { rows?: number; placeholder?: string }) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label label={label} required={required} hint={hint} tone={tone} htmlFor={id} />
      <textarea id={id} name={name} rows={rows} required={required} placeholder={placeholder} className={box(tone)} />
    </div>
  );
}

export function Honeypot() {
  return (
    <p className="hidden" aria-hidden="true">
      <label>
        Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
      </label>
    </p>
  );
}

export function Consent({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <label className={`flex items-start gap-3 text-[0.82rem] leading-snug ${tone === "dark" ? "text-lilac/75" : "text-plum-700/80"}`}>
      <input type="checkbox" name="consent" value="yes" required className="mt-0.5 h-4 w-4 shrink-0 accent-amethyst" />
      <span>I agree to be contacted by I.C. Beauty about my request. I understand this is not medical advice.</span>
    </label>
  );
}
