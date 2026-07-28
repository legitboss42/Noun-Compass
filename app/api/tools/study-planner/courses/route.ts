import { searchStudyPlannerCourses, studyPlannerStats } from "@/lib/study-planner-catalog";
import { getCurrentUser } from "@/lib/platform/auth";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

function apiHeaders() {
  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Sign in to search study-planner courses." }, { status: 401, headers: apiHeaders() });

  const limit = enforceRateLimit({
    bucket: "study-planner-course-search",
    key: user.id,
    limit: 120,
    windowMs: 60 * 60 * 1000,
  });
  if (limit.limited) {
    return Response.json(
      { message: "Too many course-search requests. Please try again later." },
      { status: 429, headers: { ...apiHeaders(), ...rateLimitHeaders(limit) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (!query.trim()) {
    return Response.json({ suggestions: [], stats: studyPlannerStats }, { headers: apiHeaders() });
  }

  return Response.json({
    suggestions: searchStudyPlannerCourses(query, 8),
    stats: studyPlannerStats,
  }, { headers: apiHeaders() });
}
