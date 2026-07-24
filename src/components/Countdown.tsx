"use client";

import { useEffect, useState } from "react";

function splitRemaining(msRemaining: number) {
  const clamped = Math.max(0, msRemaining);
  return {
    d: Math.floor(clamped / 86400000),
    h: Math.floor((clamped % 86400000) / 3600000),
    m: Math.floor((clamped % 3600000) / 60000),
    s: Math.floor((clamped % 60000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ deadlineIso, label }: { deadlineIso: string; label: string }) {
  const deadline = new Date(deadlineIso).getTime();
  // Rendered null on the server and on first client paint, then filled in on
  // mount, so the server-rendered markup never has to match a client clock.
  const [remaining, setRemaining] = useState<ReturnType<typeof splitRemaining> | null>(null);

  useEffect(() => {
    setRemaining(splitRemaining(deadline - Date.now()));
    const id = setInterval(() => setRemaining(splitRemaining(deadline - Date.now())), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const shown = remaining ?? { d: 0, h: 0, m: 0, s: 0 };

  return (
    <div className="countdown-box">
      <span className="label">{label}</span>
      <div className="countdown-nums tnum" suppressHydrationWarning>
        <div><div className="num">{pad(shown.d)}</div><div className="unit">Days</div></div>
        <div><div className="num">{pad(shown.h)}</div><div className="unit">Hrs</div></div>
        <div><div className="num">{pad(shown.m)}</div><div className="unit">Min</div></div>
        <div><div className="num">{pad(shown.s)}</div><div className="unit">Sec</div></div>
      </div>
    </div>
  );
}
