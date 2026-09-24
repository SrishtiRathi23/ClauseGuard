"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// NOTE: This uses lightweight localStorage for Phase 1-11 prototyping.
// It is not production-grade identity management. No passwords or sensitive
// tokens are stored. For production, a real auth provider (e.g. NextAuth/Clerk)
// and server-side session validation must be implemented.

interface UserSession {
  name: string;
  initials: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate session from localStorage
    const hydrateSession = () => {
      const sessionName = localStorage.getItem("clauseguard_user");
      if (sessionName) {
        setUser({
          name: sessionName,
          initials: sessionName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        });
      }
      setIsLoading(false);
    };

    hydrateSession();
  }, []);

  const signIn = (name: string) => {
    localStorage.setItem("clauseguard_user", name);
    setUser({
      name,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    });
    router.push("/analyze");
  };

  const signOut = () => {
    localStorage.removeItem("clauseguard_user");
    setUser(null);
    router.push("/");
  };

  return { user, isLoading, signIn, signOut };
}
