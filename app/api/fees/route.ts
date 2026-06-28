import { extractedCurricula, nounUpdateFeeSnapshotRetrievedAt, pureduFeeSnapshotRetrievedAt } from "@/data/curricula";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
    }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
  }

  const foundProgramme = extractedCurricula.find((item) => item.faculty === faculty && item.program === program);
  const foundLevel = foundProgramme?.levels.find((item) => item.level === level);
  const foundSemester = foundLevel?.semesters.find((item) => item.semester === semester && item.courses.length > 0);
  if (!foundProgramme || !foundLevel || !foundSemester) return Response.json({ error: "Fee result not found." }, { status: 404 });

  return Response.json({
    programme: { faculty: foundProgramme.faculty, program: foundProgramme.program },
    level: { level: foundLevel.level, label: foundLevel.label },
    semester: foundSemester,
  }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
