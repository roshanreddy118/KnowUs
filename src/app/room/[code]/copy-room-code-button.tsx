"use client";

import { useState, useTransition } from "react";

type CopyRoomCodeButtonProps = {
  code: string;
};

export function CopyRoomCodeButton({ code }: CopyRoomCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      startTransition(() => {
        window.setTimeout(() => setCopied(false), 1800);
      });
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copyCode}
      className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
    >
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}
