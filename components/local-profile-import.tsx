"use client";

import { useState, useSyncExternalStore } from "react";

const keys = ["noun-compass-study-planner-v1", "noun-compass-semester-profile-v1"];
const subscribe = () => () => undefined;
const getServerSnapshot = () => false;
const getSnapshot = () => keys.some((key) => Boolean(window.localStorage.getItem(key)));

export function LocalProfileImport() {
  const hasLocalData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  if (!hasLocalData || dismissed) return null;
  return <aside className="platform-callout"><strong>Local planning data found</strong><p>Your browser contains an earlier NounCompass study plan. Open semester setup to copy the relevant course codes into your account. Nothing is imported without your confirmation.</p><div><a className="button" href="/dashboard/profile#import-local">Review and import</a><button type="button" onClick={() => setDismissed(true)}>Not now</button></div></aside>;
}
