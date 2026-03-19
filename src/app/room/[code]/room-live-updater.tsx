"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

type RoomLiveUpdaterProps = {
  intervalMs?: number;
};

export function RoomLiveUpdater({
  intervalMs = 2000,
}: RoomLiveUpdaterProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    };

    const intervalId = window.setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [intervalMs, router, startTransition]);

  return null;
}
