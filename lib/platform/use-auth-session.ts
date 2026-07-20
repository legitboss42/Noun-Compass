"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSignedInSession() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(Boolean(session?.user));
      });

      supabase.auth.getUser().then(({ data: userData }) => {
        if (active) setSignedIn(Boolean(userData.user));
      });

      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch {
      return () => {
        active = false;
      };
    }
  }, []);

  return signedIn;
}
