import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("portal");
export default function Page() { return <CategoryRoute slug="portal" />; }
