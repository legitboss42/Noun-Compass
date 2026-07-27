"use client";

import { saveSemesterProfile } from "@/app/dashboard/actions";
import { CourseCodePicker } from "@/components/course-code-picker";

type ProfileDefaults = {
  displayName?: string | null;
  programme?: string | null;
  level?: number | null;
  semester?: number | null;
  entryMode?: string | null;
  studyCentre?: string | null;
  examMode?: string | null;
  selectedCourseCodes?: string[] | null;
  availableStudyDays?: string[] | null;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function SemesterProfileForm({ defaults, programmeNames }: { defaults: ProfileDefaults; programmeNames: string[] }) {
  return <form action={saveSemesterProfile} className="platform-form platform-profile-form"><div className="platform-form-grid"><label>Display name<input name="displayName" defaultValue={defaults.displayName ?? ""} maxLength={100} /></label><label>Programme<input name="programme" defaultValue={defaults.programme ?? ""} list="programme-options" maxLength={160} /><datalist id="programme-options">{programmeNames.map((name) => <option key={name} value={name} />)}</datalist></label><label>Level<select name="level" defaultValue={defaults.level ?? ""}><option value="">Choose level</option>{[100,200,300,400,500,600,700,800,900].map((level) => <option key={level} value={level}>{level} level</option>)}</select></label><label>Semester<select name="semester" defaultValue={defaults.semester ?? ""}><option value="">Choose semester</option><option value="1">First semester</option><option value="2">Second semester</option></select></label><label>Entry mode<select name="entryMode" defaultValue={defaults.entryMode ?? "normal"}><option value="normal">Normal entry</option><option value="direct-entry">Direct entry</option></select></label><label>Exam mode<select name="examMode" defaultValue={defaults.examMode ?? "mixed"}><option value="e-exam">E-exam</option><option value="pop">Pen-on-paper</option><option value="mixed">Mixed or unsure</option></select></label></div><label>Study centre<input name="studyCentre" defaultValue={defaults.studyCentre ?? ""} maxLength={180} placeholder="Optional; do not enter a private address" /></label><CourseCodePicker initialCodes={defaults.selectedCourseCodes ?? []} /><fieldset><legend>Days normally available for study</legend><div className="platform-checkbox-grid">{days.map((day) => <label key={day}><input name="studyDays" type="checkbox" value={day} defaultChecked={(defaults.availableStudyDays ?? []).includes(day)} />{day}</label>)}</div></fieldset><div className="platform-form-actions"><button className="button" type="submit">Save semester setup</button><span>Choose catalogue suggestions where available. Manually entered codes remain excluded from verified calculations until matched.</span></div></form>;
}
