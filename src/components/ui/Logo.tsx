import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link
      to="/recycler/dashboard"
      className="inline-flex items-center gap-3 rounded-2xl text-white transition-all duration-200 hover:text-white"
      aria-label="GREEN LOOP dashboard"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-[0_0_28px_rgba(16,185,129,0.35)] ring-1 ring-emerald-200/30">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
        GREEN LOOP
      </span>
    </Link>
  );
}
