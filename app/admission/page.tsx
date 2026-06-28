import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("admission");
export default function Page() { return <CategoryRoute slug="admission" />; }
