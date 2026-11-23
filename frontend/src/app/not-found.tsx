import Link from "next/link";
import { NotFoundArt } from "@/components/layout/NotFoundArt";

export default function NotFound() {
  return <div className="page-shell empty-panel"><NotFoundArt /><p className="eyebrow">404</p><h1>Kopinya habis di halaman ini.</h1><p>Halaman yang Anda cari tidak tersedia. Mari kembali ke kedai.</p><Link className="button-primary" href="/">Kembali ke kedai</Link></div>;
}
