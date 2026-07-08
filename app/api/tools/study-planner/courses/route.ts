import { searchStudyPlannerCourses, studyPlannerStats } from "@/lib/study-planner-catalog";

function apiHeaders() {
  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}

export async function GET(request: Request) {
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
