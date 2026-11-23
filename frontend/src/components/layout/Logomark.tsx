import type { SVGProps } from "react";

export function Logomark({ size = 24, title = "KopiOptima", ...props }: SVGProps<SVGSVGElement> & { size?: 24 | 64; title?: string }) {
  return <svg aria-label={title} height={size} role="img" viewBox="0 0 64 64" width={size} {...props}>
    <path d="M32 4C14 4 7 17 9 32s12 28 23 28 21-13 23-28S50 4 32 4Z" fill="var(--text-1)" />
    <path d="M14 36c7-13 13-18 19-18 7 0 11 7 17 15-7-5-12-6-17-3-6 4-12 7-22 6Z" fill="var(--accent)" />
    <path d="M18 43c10-3 12-17 19-17 5 0 7 5 11 9" fill="none" stroke="var(--bg-base)" strokeLinecap="round" strokeWidth="4" />
  </svg>;
}
