import { akademik } from "./akademik";
import { awam, type AppCopy } from "./awam";

export type LanguageMode = "awam" | "akademik";
export { type AppCopy };
export const copyFor = (mode: LanguageMode): AppCopy => (mode === "akademik" ? akademik : awam);
