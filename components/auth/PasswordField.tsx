"use client";

import { useState } from "react";

export function PasswordField({ id, name, label, autoComplete = "current-password" }: { id: string; name: string; label: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2 flex rounded-2xl border border-line bg-background focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold">
        <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required className="min-h-12 min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 outline-none" />
        <button type="button" onClick={() => setShow((v) => !v)} className="min-h-12 rounded-r-2xl px-4 text-sm font-bold text-teal hover:text-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">{show ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}
