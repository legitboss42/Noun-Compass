import type { Metadata } from "next";
import { CategoryRoute, categoryMetadata } from "@/app/category-route";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q = "" } = await searchParams;
  const base = categoryMetadata("student-guides");
  if (!q.trim()) return base;
  return {
    ...base,
    robots: { index: false, follow: true },
  };
}
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <div id="guides"><CategoryRoute slug="student-guides" query={q} /></div>;
}
