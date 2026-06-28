import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("results");
export default function Page() { return <CategoryRoute slug="results" />; }
