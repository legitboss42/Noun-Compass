export function saveToolActivity(toolKey: string, summary: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  void fetch("/api/tools/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolKey, summary }),
  }).catch(() => {
    // Tool output remains usable if the signed-in activity save fails.
  });
}
