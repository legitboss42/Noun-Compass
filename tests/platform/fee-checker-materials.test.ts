import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "@/app/api/fees/route";

test("fee results include verified course-material download links", async () => {
  const previousPilot = process.env.LOCAL_PILOT;
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousDatabaseUrl = process.env.LOCAL_DATABASE_URL;

  process.env.LOCAL_PILOT = "true";
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.LOCAL_DATABASE_URL = "postgresql://localhost/nouncompass_test";

  try {
    const params = new URLSearchParams({
      faculty: "Faculty of Computing",
      program: "B.sc. Computer Science",
      level: "300",
      semester: "1",
    });
    const response = await GET(new Request(`https://nouncompass.me/api/fees?${params}`));
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.ok(result.semester.courses.length > 0);

    const linkedCourses = result.semester.courses.filter(
      (course: { material?: { downloadUrl?: string } | null }) => course.material,
    );
    assert.ok(linkedCourses.length > 0);

    for (const course of linkedCourses) {
      assert.match(
        course.material.downloadUrl,
        /^\/api\/course-materials\/download\?code=[A-Z0-9]+&url=https%3A%2F%2Fnou\.edu\.ng%2Fcoursewarecontent%2F/,
      );
    }
  } finally {
    if (previousPilot === undefined) delete process.env.LOCAL_PILOT;
    else process.env.LOCAL_PILOT = previousPilot;
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousDatabaseUrl === undefined) delete process.env.LOCAL_DATABASE_URL;
    else process.env.LOCAL_DATABASE_URL = previousDatabaseUrl;
  }
});
