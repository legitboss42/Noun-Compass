import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("examinations");
export default function Page() { return <CategoryRoute slug="examinations" />; }
