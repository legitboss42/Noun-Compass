"use client";

import { useState } from "react";

export function CopyPathButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="admin-button admin-button-secondary admin-button-small"
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
    >
      {copied ? "Copied" : "Copy file path"}
    </button>
  );
}
