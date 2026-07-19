import { CategoryRoute, categoryMetadata } from "@/app/category-route";

export const metadata = categoryMetadata("results");

export default function ResultsPage() {
  return <CategoryRoute slug="results" />;
}
