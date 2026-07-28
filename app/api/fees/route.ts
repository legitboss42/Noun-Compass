import { extractedCurricula, nounUpdateFeeSnapshotRetrievedAt, pureduFeeSnapshotRetrievedAt } from "@/data/curricula";
import { courseMaterialDownloadUrl, findCourseMaterial } from "@/lib/course-materials";
import { getCurrentUser } from "@/lib/platform/auth";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";

function apiHeaders(extra: Record<string, string> = {}) {
  return {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    ...extra,
  };
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Sign in to use the fee checker." }, { status: 401, headers: apiHeaders() });

  const limit = enforceRateLimit({
    bucket: "fees",
    key: user.id,
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (limit.limited) {
    return Response.json(
      { message: "Too many fee-checker requests. Please try again later." },
      { status: 429, headers: apiHeaders(rateLimitHeaders(limit)) },
    );
  }

  const params = new URL(request.url).searchParams;
  const faculty = params.get("faculty");
  const program = params.get("program");
  const level = params.get("level");
  const semester = params.get("semester");

  if (!faculty || !program || !level || !semester) {
    return Response.json({
      catalog: extractedCurricula.map((item) => ({
        faculty: item.faculty,
        program: item.program,
        levels: item.levels.map((levelItem) => ({
          level: levelItem.level,
          label: levelItem.label,
          semesters: levelItem.semesters.map((semesterItem) => ({ semester: semesterItem.semester, label: semesterItem.label, available: semesterItem.courses.length > 0 })),
        })),
      })),
      pureduFeeSnapshotRetrievedAt,
      nounUpdateFeeSnapshotRetrievedAt,
    }, { headers: apiHeaders() });
  }

  const foundProgramme = extractedCurricula.find((item) => item.faculty === faculty && item.program === program);
  const foundLevel = foundProgramme?.levels.find((item) => item.level === level);
  const foundSemester = foundLevel?.semesters.find((item) => item.semester === semester && item.courses.length > 0);
  if (!foundProgramme || !foundLevel || !foundSemester) {
    return Response.json({ error: "Fee result not found." }, { status: 404, headers: apiHeaders() });
  }

  const courses = foundSemester.courses.map((course) => {
    const material = findCourseMaterial(course.code, course.title);
    return {
      ...course,
      material: material ? {
        title: material.title,
        downloadUrl: courseMaterialDownloadUrl(material),
      } : null,
    };
  });

  return Response.json({
    programme: { faculty: foundProgramme.faculty, program: foundProgramme.program },
    level: { level: foundLevel.level, label: foundLevel.label },
    semester: { ...foundSemester, courses },
  }, { headers: apiHeaders() });
}
