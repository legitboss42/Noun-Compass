import { CategoryRoute, categoryMetadata } from "@/app/category-route";
export const metadata = categoryMetadata("gst");
export default function Page() { return <CategoryRoute slug="gst" />; }
