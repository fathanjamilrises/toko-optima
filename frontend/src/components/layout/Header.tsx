"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logomark } from "./Logomark";
import { ModeToggle } from "./ModeToggle";

function HeaderControls() {
  const params = useSearchParams();
  const mode = params.get("mode") === "akademik" ? "akademik" : "awam";
  return <ModeToggle mode={mode} />;
}

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link aria-label="KopiOptima — Beranda" className="brand" href="/">
          <Logomark />
          <span>KopiOptima</span>
        </Link>
        <Suspense fallback={<div className="mode-toggle" />}>
          <HeaderControls />
        </Suspense>
      </div>
    </header>
  );
}
