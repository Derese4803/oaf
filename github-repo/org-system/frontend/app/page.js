"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const { token } = getSession();
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);
  return null;
}
