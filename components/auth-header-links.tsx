"use client";

import Link from "next/link";
import { useSignedInSession } from "@/lib/platform/use-auth-session";

export function AuthHeaderLinks() {
  const signedIn = useSignedInSession();

  if (signedIn) {
    return <Link className="dashboard-link" href="/dashboard">Dashboard</Link>;
  }

  return (
    <>
      <Link className="sign-in-link" href="/account/sign-in">Sign in</Link>
      <Link className="account-link" href="/account/sign-up">Create free account</Link>
      <Link className="dashboard-link" href="/dashboard">Dashboard</Link>
    </>
  );
}
