"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface UseAuthOptions {
  requireAdmin?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    api
      .getUser()
      .then((userData) => {
        if (options.requireAdmin && userData.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        setUser(userData);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router, options.requireAdmin]);

  async function logout() {
    try {
      await api.logout();
    } finally {
      api.setToken(null);
      localStorage.removeItem("distriboo_user");
      router.push("/login");
    }
  }

  return { user, loading, logout };
}
