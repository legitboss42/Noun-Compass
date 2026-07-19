import { SemesterProfileForm } from "@/components/semester-profile-form";
import { programmes } from "@/data/programmes";
import { requireUser } from "@/lib/platform/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser("/dashboard/profile");
  const params = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase?.from("profiles").select("*").eq("id", user.id).maybeSingle() ?? { data: null };
  return <><header className="platform-heading"><div><span className="eyebrow">Private profile</span><h1>Set up this semester</h1><p>Add only the academic details needed to personalise your dashboard. Confirm the final course list and dates on your own NOUN account.</p></div></header>{params.error && <p className="form-message form-message-error">{params.error}</p>}<section className="platform-panel"><SemesterProfileForm programmeNames={programmes.map((programme) => programme.name)} defaults={{ displayName: profile?.display_name, programme: profile?.programme, level: profile?.level, semester: profile?.semester, entryMode: profile?.entry_mode, studyCentre: profile?.study_centre, examMode: profile?.exam_mode, selectedCourseCodes: profile?.selected_course_codes, availableStudyDays: profile?.available_study_days }} /></section></>;
}
