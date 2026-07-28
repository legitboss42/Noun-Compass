"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { saveToolActivity } from "@/lib/platform/tool-activity-client";
import styles from "./fee-checker.module.css";

type CatalogSemester = { semester: string; label: string; available: boolean };
type CatalogLevel = { level: string; label: string; semesters: CatalogSemester[] };
type CatalogProgramme = { faculty: string; program: string; levels: CatalogLevel[] };
type CourseMaterialLink = { title: string; downloadUrl: string };
type Course = { code: string; title: string; units: number; status: string; courseFee: number; examFee: number; material?: CourseMaterialLink | null };
type FeeSemester = { semester: string; label: string; semesterFee: number; courses: Course[]; feeSource?: "puredu-live-snapshot" | "nounupdate-live-snapshot"; feeRetrievedAt?: string; sourceTotals?: { courseFee: number; examFee: number; semesterFee: number; allFees: number } };
type FeeResult = { programme: { faculty: string; program: string }; level: { level: string; label: string }; semester: FeeSemester };

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const formatDate = (value: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
const safeFileName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function FeeChecker() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<CatalogProgramme[]>([]);
  const [snapshotDates, setSnapshotDates] = useState({ puredu: "", nounUpdate: "" });
  const [faculty, setFaculty] = useState("");
  const [programmeName, setProgrammeName] = useState("");
  const [levelValue, setLevelValue] = useState("");
  const [semesterValue, setSemesterValue] = useState("");
  const [result, setResult] = useState<FeeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingImage, setExportingImage] = useState(false);

  useEffect(() => {
    fetch("/api/fees").then((response) => response.json()).then((data) => {
      setCatalog(data.catalog ?? []);
      setSnapshotDates({ puredu: data.pureduFeeSnapshotRetrievedAt ?? "", nounUpdate: data.nounUpdateFeeSnapshotRetrievedAt ?? "" });
    }).catch(() => setError("The fee catalog could not be loaded. Please refresh and try again.")).finally(() => setLoading(false));
  }, []);

  const faculties = [...new Set(catalog.map((item) => item.faculty))];
  const facultyProgrammes = catalog.filter((item) => item.faculty === faculty);
  const selectedProgramme = facultyProgrammes.find((item) => item.program === programmeName);
  const selectedLevel = selectedProgramme?.levels.find((item) => item.level === levelValue);
  const availableSemesters = selectedLevel?.semesters.filter((item) => item.available) ?? [];
  const selectedSemester = availableSemesters.find((item) => item.semester === semesterValue);
  const ready = Boolean(faculty && selectedProgramme && selectedLevel && selectedSemester);

  const reset = (stage: "faculty" | "programme" | "level" | "semester", value: string) => {
    if (stage === "faculty") { setFaculty(value); setProgrammeName(""); setLevelValue(""); setSemesterValue(""); }
    if (stage === "programme") { setProgrammeName(value); setLevelValue(""); setSemesterValue(""); }
    if (stage === "level") { setLevelValue(value); setSemesterValue(""); }
    if (stage === "semester") setSemesterValue(value);
    setResult(null);
    setError("");
  };

  const loadResult = async () => {
    if (!ready) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ faculty, program: programmeName, level: levelValue, semester: semesterValue });
      const response = await fetch(`/api/fees?${query.toString()}`);
      if (!response.ok) throw new Error("Unavailable");
      const nextResult = await response.json() as FeeResult;
      setResult(nextResult);
      const nextCourses = nextResult.semester.courses ?? [];
      const nextCourseTotal = nextResult.semester.sourceTotals?.courseFee ?? nextCourses.reduce((sum, course) => sum + course.courseFee, 0);
      const nextExamTotal = nextResult.semester.sourceTotals?.examFee ?? nextCourses.reduce((sum, course) => sum + course.examFee, 0);
      const nextTotal = nextResult.semester.sourceTotals?.allFees ?? (nextResult.semester.semesterFee + nextCourseTotal + nextExamTotal);
      saveToolActivity("fee-checker", {
        programme: nextResult.programme.program,
        faculty: nextResult.programme.faculty,
        level: nextResult.level.label,
        semester: nextResult.semester.label,
        total: nextTotal,
        courses: nextCourses.length,
        units: nextCourses.reduce((sum, course) => sum + course.units, 0),
        feesAvailable: Boolean(nextResult.semester.feeSource),
      });
    } catch {
      setError("This fee breakdown could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!reportRef.current || !result) return;
    setExportingImage(true);
    try {
      const { toPng } = await import("html-to-image");
      const report = reportRef.current;
      const dataUrl = await toPng(report, { backgroundColor: "#f5f8f6", pixelRatio: 2, width: report.scrollWidth, height: report.scrollHeight, filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true") });
      const link = document.createElement("a");
      link.download = `nouncompass-${safeFileName(result.programme.program)}-${result.level.level}-level-${result.semester.semester}-semester-fee-breakdown.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExportingImage(false);
    }
  };

  const courses = result?.semester.courses ?? [];
  const feesAvailable = Boolean(result?.semester.feeSource);
  const feeSourceName = result?.semester.feeSource === "nounupdate-live-snapshot" ? "NOUN Update" : "Puredu";
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
  const coreCount = courses.filter((course) => course.status === "C").length;
  const electiveCount = courses.filter((course) => course.status === "E").length;
  const calculatedCourseTotal = courses.reduce((sum, course) => sum + course.courseFee, 0);
  const calculatedExamTotal = courses.reduce((sum, course) => sum + course.examFee, 0);
  const courseTotal = result?.semester.sourceTotals?.courseFee ?? calculatedCourseTotal;
  const examTotal = result?.semester.sourceTotals?.examFee ?? calculatedExamTotal;
  const completeTotal = result?.semester.sourceTotals?.allFees ?? ((result?.semester.semesterFee ?? 0) + courseTotal + examTotal);
  const newStudent = levelValue === "100" && semesterValue === "1";
  const totalsMismatch = feesAvailable && (calculatedCourseTotal !== courseTotal || calculatedExamTotal !== examTotal);

  return <section className={styles.analyzer} aria-labelledby="course-analyzer-title">
    <div className={styles.analyzerEntry}>
      <span className={styles.entryKicker}>NOUN Course Catalog</span>
      <h2 id="course-analyzer-title">Find every course in your semester</h2>
      <p>Select your faculty, programme, level, and semester to load the available fee breakdown for that selection.</p>
      <strong>Faculty → Programme → Level → Semester</strong>
      <div className={styles.progress}><span className={faculty ? styles.done : styles.current}>Faculty</span><span className={selectedProgramme ? styles.done : faculty ? styles.current : ""}>Programme</span><span className={selectedLevel ? styles.done : selectedProgramme ? styles.current : ""}>Level</span><span className={selectedSemester ? styles.done : selectedLevel ? styles.current : ""}>Semester</span></div>
      <div className={styles.progressiveSelect}>
        {!faculty && <label><span className="sr-only">Select faculty</span><select value={faculty} onChange={(event) => reset("faculty", event.target.value)} disabled={loading}><option value="">{loading ? "Loading faculties..." : "Select Faculty"}</option>{faculties.map((item) => <option key={item}>{item}</option>)}</select></label>}
        {faculty && !programmeName && <label><span className="sr-only">Select programme</span><select value={programmeName} onChange={(event) => reset("programme", event.target.value)}><option value="">Select Programme</option>{facultyProgrammes.map((item) => <option key={item.program} value={item.program} disabled={!item.levels.some((level) => level.semesters.some((semester) => semester.available))}>{item.program}</option>)}</select></label>}
        {selectedProgramme && !levelValue && <label><span className="sr-only">Select level</span><select value={levelValue} onChange={(event) => reset("level", event.target.value)}><option value="">Select Level</option>{selectedProgramme.levels.map((item) => <option key={item.level} value={item.level} disabled={!item.semesters.some((semester) => semester.available)}>{item.label}</option>)}</select></label>}
        {selectedLevel && !semesterValue && <label><span className="sr-only">Select semester</span><select value={semesterValue} onChange={(event) => reset("semester", event.target.value)}><option value="">Select Semester</option>{availableSemesters.map((item) => <option key={item.semester} value={item.semester}>{item.label}</option>)}</select></label>}
        {ready && !result && <button type="button" onClick={loadResult} disabled={loading}>{loading ? "Loading breakdown..." : "View semester fees"} <span aria-hidden="true">→</span></button>}
      </div>
      {error && <p className={styles.verificationBlock} role="alert">{error}</p>}
      {faculty && <div className={styles.selectionSummary}><button type="button" onClick={() => reset("faculty", "")}>Start over</button>{selectedProgramme && <span>{selectedProgramme.program}</span>}{selectedLevel && <span>{selectedLevel.label}</span>}{selectedSemester && <span>{selectedSemester.label}</span>}{selectedSemester && <span>{newStudent ? "New student" : "Returning student"}</span>}</div>}
    </div>

    <aside className={styles.rateAudit}><div><strong>Latest fee updates we checked</strong><p>Main update: {snapshotDates.puredu ? formatDate(snapshotDates.puredu) : "pending"}; follow-up update: {snapshotDates.nounUpdate ? formatDate(snapshotDates.nounUpdate) : "pending"}. Check your portal before you pay.</p></div><a href="https://nou.edu.ng" target="_blank" rel="noreferrer">Visit official NOUN</a></aside>

    {result && <><article ref={reportRef} className={`${styles.generated} fee-report-printable`}>
      <header className={styles.documentHeader}>
        <Image src="/images/brand/nouncompass-logo.svg" alt="NOUN Compass" width={360} height={92} />
        <span>Fee estimate</span>
      </header>

      <div className={styles.documentIntro}>
        <div>
          <span className={styles.kicker}>Plan clearly before you pay</span>
          <h3>Your NOUN fee estimate</h3>
          <p>A clear breakdown of the semester fees and courses in your selected programme.</p>
        </div>
        <button type="button" className={styles.changeSelection} data-export-ignore="true" onClick={() => setResult(null)}>Change selection</button>
      </div>

      <dl className={styles.studentSummary}>
        <div><dt>Programme</dt><dd>{result.programme.program}</dd></div>
        <div><dt>Faculty</dt><dd>{result.programme.faculty}</dd></div>
        <div><dt>Level</dt><dd>{result.level.label}</dd></div>
        <div><dt>Semester</dt><dd>{result.semester.label}</dd></div>
        <div><dt>Student type</dt><dd>{newStudent ? "New student" : "Returning student"}</dd></div>
      </dl>

      <section className={styles.feeSummary} aria-labelledby="fee-summary-title">
        <div className={styles.sectionTitle}><div><span>01</span><h4 id="fee-summary-title">Estimated fee summary</h4></div><strong>{courses.length} listed courses</strong></div>
        <div className={styles.feeSummaryGrid}>
          <div><span>{newStudent ? "New-student semester fee" : "Returning-student semester fee"}</span><strong>{feesAvailable ? formatNaira(result.semester.semesterFee) : "Pending"}</strong><small>Base semester amount</small></div>
          <div><span>Course registration</span><strong>{feesAvailable ? formatNaira(courseTotal) : "Pending"}</strong><small>{totalUnits} credit units listed</small></div>
          <div><span>Exam registration</span><strong>{feesAvailable ? formatNaira(examTotal) : "Pending"}</strong><small>Across the listed courses</small></div>
          <div className={styles.totalCard}><span>Estimated total</span><strong>{feesAvailable ? formatNaira(completeTotal) : "Pending"}</strong><small>Semester + course + exam fees</small></div>
        </div>
      </section>

      <section className={styles.feeSection}>
        <div className={styles.sectionTitle}><div><span>02</span><h4>Semester courses and charges</h4></div><strong>{coreCount} compulsory · {electiveCount} elective</strong></div>
        <p className={styles.electiveNote}>Review every course against your registration record. A material button appears only where an official-source PDF is indexed.</p>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>S/N</th><th>Course</th><th>Units</th><th>Status</th><th>Course fee</th><th>Exam fee</th><th>Material</th></tr></thead>
            <tbody>{courses.map((course, index) => <tr key={`${course.code}-${index}`}>
              <td>{index + 1}</td>
              <td><strong>{course.code}</strong><span className={styles.courseTitle}>{course.title}</span></td>
              <td>{course.units}</td>
              <td><span className={course.status === "C" ? styles.compulsory : styles.elective}>{course.status === "C" ? "Compulsory" : course.status === "E" ? "Elective" : course.status}</span></td>
              <td>{feesAvailable ? formatNaira(course.courseFee) : "Pending"}</td>
              <td>{feesAvailable ? formatNaira(course.examFee) : "Pending"}</td>
              <td>{course.material
                ? <a className={styles.materialLink} href={course.material.downloadUrl} target="_blank" rel="noopener noreferrer" title={`Download ${course.material.title}`}>Download PDF</a>
                : <span className={styles.materialPending}>Not listed</span>}</td>
            </tr>)}</tbody>
            <tfoot><tr><td colSpan={2}>Listed course totals</td><td>{totalUnits} units</td><td>{coreCount} C · {electiveCount} E</td><td>{feesAvailable ? formatNaira(calculatedCourseTotal) : "Pending"}</td><td>{feesAvailable ? formatNaira(calculatedExamTotal) : "Pending"}</td><td>{courses.filter((course) => course.material).length} materials</td></tr></tfoot>
          </table>
        </div>
      </section>

      <section className={styles.beforePay} aria-labelledby="before-pay-title">
        <div><span>03</span><h4 id="before-pay-title">Before you pay</h4></div>
        <ol>
          <li><strong>Verify your selection</strong><span>Confirm your programme, level and semester.</span></li>
          <li><strong>Review the course rows</strong><span>Remove courses that are not on your portal record.</span></li>
          <li><strong>Confirm the final amount</strong><span>Use the amount displayed on the official NOUN portal.</span></li>
        </ol>
      </section>

      <p className={styles.summaryNote}>{totalsMismatch ? `${feeSourceName}'s totals do not fully match the visible course-row sum in this checker. Compare carefully with your portal before you pay.` : "Estimate only — confirm every amount and course on the official NOUN portal before payment."}</p>

      <footer className={styles.documentFooter}>
        <div><strong>Generated by NounCompass</strong><a href="https://nouncompass.me">nouncompass.me</a></div>
        <span>Independent student guidance · Not an official NOUN invoice</span>
                <span>Course list continues as needed</span>
      </footer>
    </article><div className={styles.exportActions} aria-label="Export fee breakdown"><div><strong>Save this fee estimate</strong><span>The PDF includes the fee summary, complete course list, and clickable course-material links.</span></div><div><button type="button" onClick={() => window.print()}>Print / Save as PDF</button><button type="button" onClick={downloadImage} disabled={exportingImage}>{exportingImage ? "Preparing image..." : "Download as image"}</button></div></div></>}
  </section>;
}
