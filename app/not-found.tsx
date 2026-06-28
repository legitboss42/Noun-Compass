import Link from "next/link";
import { BlogCover } from "@/components/BlogCover";

export default function NotFound() {
  return <main id="main-content" className="container empty-page"><div className="empty-cover"><BlogCover title="This guide is off the map" subtitle="The page may have moved, expired, or the address may be incorrect." category="support" theme="support" mode="hero" /></div><Link className="button" href="/">Return home</Link></main>;
}
