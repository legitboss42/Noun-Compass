import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("study-centres");
export default function Page() { return <CategoryRoute slug="study-centres" />; }
