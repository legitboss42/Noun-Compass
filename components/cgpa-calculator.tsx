"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./cgpa-calculator.module.css";

type CourseRow = {
  id: number;
  code: string;
  units: string;
  score: string;
};

type SemesterBlock = {
  id: number;
  sessionLabel: string;
  semesterLabel: string;
  rows: CourseRow[];
};

type GradeBand = {
  min: number;
  max: number;
  letter: "A" | "B" | "C" | "D" | "E" | "F";
  points: number;
  meaning: string;
};

const gradeBands: GradeBand[] = [
  { min: 70, max: 100, letter: "A", points: 5, meaning: "Excellent" },
  { min: 60, max: 69, letter: "B", points: 4, meaning: "Very good" },
  { min: 50, max: 59, letter: "C", points: 3, meaning: "Credit" },
  { min: 45, max: 49, letter: "D", points: 2, meaning: "Pass" },
  { min: 40, max: 44, letter: "E", points: 1, meaning: "Poor" },
  { min: 0, max: 39, letter: "F", points: 0, meaning: "Fail" },
];

const classBands = [
  { min: 4.5, max: 5, label: "First Class Division" },
  { min: 3.5, max: 4.49, label: "Second Class Upper Division" },
  { min: 2.4, max: 3.49, label: "Second Class Lower Division" },
  { min: 1.5, max: 2.39, label: "Third Class Division" },
];

const exampleSemesterBlocks: SemesterBlock[] = [
  {
    id: 1,
    sessionLabel: "2025/2026 Session",
    semesterLabel: "First Semester",
    rows: [
      { id: 1, code: "ENG 114", units: "2", score: "56" },
      { id: 2, code: "GST 105", units: "3", score: "71" },
      { id: 3, code: "MAC 324", units: "2", score: "45" },
      { id: 4, code: "ENG 224", units: "2", score: "66" },
      { id: 5, code: "GST 205", units: "3", score: "55" },
      { id: 6, code: "MAC 212", units: "2", score: "60" },
      { id: 7, code: "FMC 224", units: "2", score: "75" },
      { id: 8, code: "MAC 322", units: "2", score: "58" },
    ],
  },
];

function emptyRow(id: number): CourseRow {
  return { id, code: "", units: "", score: "" };
}

function emptySemesterBlock(id: number): SemesterBlock {
  return {
    id,
    sessionLabel: "",
    semesterLabel: "",
    rows: [emptyRow(1)],
  };
}

function getGradeBand(score: number) {
  return gradeBands.find((band) => score >= band.min && score <= band.max) ?? null;
}

function getClassOfDegree(value: number) {
  return (
    classBands.find((band) => value >= band.min && value <= band.max)?.label ??
    "Below third class range"
  );
}

export function CgpaCalculator() {
  const [semesters, setSemesters] = useState<SemesterBlock[]>(exampleSemesterBlocks);

  const computed = useMemo(() => {
    const normalizedSemesters = semesters.map((semester) => {
      const normalizedRows = semester.rows.map((row) => {
        const units = Number(row.units);
        const score = Number(row.score);
        const validUnits = Number.isFinite(units) && units > 0;
        const validScore = Number.isFinite(score) && score >= 0 && score <= 100;
        const band = validScore ? getGradeBand(score) : null;
        const qualityPoints = validUnits && band ? units * band.points : 0;

        return {
          ...row,
          units: validUnits ? units : null,
          score: validScore ? score : null,
          band,
          qualityPoints,
          isComplete: Boolean(row.code.trim()) && validUnits && validScore,
        };
      });

      const completeRows = normalizedRows.filter((row) => row.isComplete);
      const totalUnits = completeRows.reduce((sum, row) => sum + (row.units ?? 0), 0);
      const totalQualityPoints = completeRows.reduce(
        (sum, row) => sum + row.qualityPoints,
        0,
      );
      const gpa = totalUnits ? totalQualityPoints / totalUnits : 0;

      return {
        ...semester,
        rows: normalizedRows,
        completeRows,
        totalUnits,
        totalQualityPoints,
        gpa,
        roundedGpa: Number(gpa.toFixed(2)),
        classOfDegree: totalUnits
          ? getClassOfDegree(gpa)
          : "Enter your courses to calculate",
      };
    });

    const totalUnits = normalizedSemesters.reduce(
      (sum, semester) => sum + semester.totalUnits,
      0,
    );
    const totalQualityPoints = normalizedSemesters.reduce(
      (sum, semester) => sum + semester.totalQualityPoints,
      0,
    );
    const cgpa = totalUnits ? totalQualityPoints / totalUnits : 0;

    return {
      semesters: normalizedSemesters,
      totalUnits,
      totalQualityPoints,
      cgpa,
      roundedCgpa: Number(cgpa.toFixed(2)),
      classOfDegree: totalUnits
        ? getClassOfDegree(cgpa)
        : "Enter your courses to calculate",
      completedCourses: normalizedSemesters.reduce(
        (sum, semester) => sum + semester.completeRows.length,
        0,
      ),
      invalidRows: normalizedSemesters.flatMap((semester) =>
        semester.rows
          .filter((row) => row.code.trim() || row.units !== null || row.score !== null)
          .filter((row) => !row.isComplete),
      ),
    };
  }, [semesters]);

  const addSemester = () => {
    const nextId = semesters.length
      ? Math.max(...semesters.map((semester) => semester.id)) + 1
      : 1;
    setSemesters((current) => [...current, emptySemesterBlock(nextId)]);
  };

  const removeSemester = (semesterId: number) => {
    setSemesters((current) =>
      current.length === 1
        ? current
        : current.filter((semester) => semester.id !== semesterId),
    );
  };

  const updateSemesterField = (
    semesterId: number,
    field: "sessionLabel" | "semesterLabel",
    value: string,
  ) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === semesterId ? { ...semester, [field]: value } : semester,
      ),
    );
  };

  const addRow = (semesterId: number) => {
    setSemesters((current) =>
      current.map((semester) => {
        if (semester.id !== semesterId) return semester;
        const nextRowId = semester.rows.length
          ? Math.max(...semester.rows.map((row) => row.id)) + 1
          : 1;
        return { ...semester, rows: [...semester.rows, emptyRow(nextRowId)] };
      }),
    );
  };

  const removeRow = (semesterId: number, rowId: number) => {
    setSemesters((current) =>
      current.map((semester) => {
        if (semester.id !== semesterId) return semester;
        if (semester.rows.length === 1) return semester;
        return {
          ...semester,
          rows: semester.rows.filter((row) => row.id !== rowId),
        };
      }),
    );
  };

  const updateRow = (
    semesterId: number,
    rowId: number,
    field: keyof Omit<CourseRow, "id">,
    value: string,
  ) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              rows: semester.rows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
              ),
            }
          : semester,
      ),
    );
  };

  const loadExample = () => setSemesters(exampleSemesterBlocks);
  const clearAll = () => setSemesters([emptySemesterBlock(1)]);

  return (
    <div className={styles.calculator}>
      <section className={styles.introCard}>
        <span className="eyebrow">Version 2 calculator</span>
        <h2>Calculate semester GPA and cumulative CGPA across multiple semesters</h2>
        <p>
          Add as many sessions and semesters as you need. For each semester,
          enter the course code, credit unit, and final score out of 100. The
          calculator works out each semester GPA and then combines all semesters
          into one cumulative CGPA.
        </p>
        <div className={styles.statsRow}>
          <div>
            <strong>70 - 100</strong>
            <span>A grade - 5 points</span>
          </div>
          <div>
            <strong>60 - 69</strong>
            <span>B grade - 4 points</span>
          </div>
          <div>
            <strong>50 - 59</strong>
            <span>C grade - 3 points</span>
          </div>
          <div>
            <strong>0 - 49</strong>
            <span>D, E, or F based on the exact band</span>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>01</span>
          <div>
            <h3>Build your academic history</h3>
            <p>
              Create one block for each semester you want included in the
              calculation. This makes it easier for a 300-level or 400-level
              student to combine several semesters into one running CGPA.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className="button" onClick={addSemester}>
            Add semester block
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={loadExample}
          >
            Load worked example
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearAll}
          >
            Clear everything
          </button>
        </div>
      </section>

      {computed.semesters.map((semester, index) => (
        <section key={semester.id} className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>
                {semester.sessionLabel || semester.semesterLabel
                  ? `${semester.sessionLabel || "Unnamed session"} - ${
                      semester.semesterLabel || "Unnamed semester"
                    }`
                  : "New semester block"}
              </h3>
              <p>
                Enter the session, semester, and the courses that belong to this
                semester only.
              </p>
            </div>
          </div>

          <div className={styles.semesterMetaGrid}>
            <label>
              <span>Session</span>
              <input
                value={semester.sessionLabel}
                onChange={(event) =>
                  updateSemesterField(
                    semester.id,
                    "sessionLabel",
                    event.target.value,
                  )
                }
                placeholder="2025/2026 Session"
              />
            </label>
            <label>
              <span>Semester</span>
              <input
                value={semester.semesterLabel}
                onChange={(event) =>
                  updateSemesterField(
                    semester.id,
                    "semesterLabel",
                    event.target.value,
                  )
                }
                placeholder="Second Semester"
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className="button"
              onClick={() => addRow(semester.id)}
            >
              Add course to this semester
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => removeSemester(semester.id)}
            >
              Remove semester block
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Units</th>
                  <th>Score / 100</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th>Units x Points</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {semester.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        value={row.code}
                        onChange={(event) =>
                          updateRow(
                            semester.id,
                            row.id,
                            "code",
                            event.target.value,
                          )
                        }
                        placeholder="GST 105"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={row.units ?? ""}
                        onChange={(event) =>
                          updateRow(
                            semester.id,
                            row.id,
                            "units",
                            event.target.value,
                          )
                        }
                        placeholder="3"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={row.score ?? ""}
                        onChange={(event) =>
                          updateRow(
                            semester.id,
                            row.id,
                            "score",
                            event.target.value,
                          )
                        }
                        placeholder="71"
                      />
                    </td>
                    <td className={styles.gradeCell}>
                      <strong>{row.band?.letter ?? "-"}</strong>
                      <span>{row.band?.meaning ?? "Waiting for score"}</span>
                    </td>
                    <td>{row.band?.points ?? "-"}</td>
                    <td>{row.isComplete ? row.qualityPoints : "-"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeRow(semester.id, row.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.semesterSummary}>
            <article>
              <span>Semester GPA</span>
              <strong>
                {semester.completeRows.length
                  ? semester.roundedGpa.toFixed(2)
                  : "0.00"}
              </strong>
              <small>{semester.classOfDegree}</small>
            </article>
            <article>
              <span>Total units</span>
              <strong>{semester.totalUnits}</strong>
              <small>Across complete rows in this semester.</small>
            </article>
            <article>
              <span>Total quality points</span>
              <strong>{semester.totalQualityPoints}</strong>
              <small>Units multiplied by grade points in this semester.</small>
            </article>
          </div>
        </section>
      ))}

      {computed.invalidRows.length > 0 && (
        <p className={styles.warning}>
          Some rows are incomplete or contain a score outside 0 to 100.
          Complete those rows or clear them before relying on the final result.
        </p>
      )}

      <section className={styles.results}>
        <div className={styles.resultHeader}>
          <div>
            <span className="eyebrow">Calculated result</span>
            <h2>Your cumulative CGPA estimate</h2>
            <p className={styles.resultNote}>
              Each semester GPA is calculated separately first, then the
              cumulative CGPA is worked out from the total quality points and
              total units across all completed semesters.
            </p>
          </div>
          <div className={styles.resultMeta}>
            <article>
              <span>Final CGPA</span>
              <strong>
                {computed.completedCourses
                  ? computed.roundedCgpa.toFixed(2)
                  : "0.00"}
              </strong>
            </article>
            <article>
              <span>Class</span>
              <strong>{computed.classOfDegree}</strong>
            </article>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <article>
            <span>Completed courses</span>
            <strong>{computed.completedCourses}</strong>
            <small>Only complete rows are included in the calculation.</small>
          </article>
          <article>
            <span>Total semesters</span>
            <strong>{computed.semesters.length}</strong>
            <small>All semester blocks currently in the calculator.</small>
          </article>
          <article>
            <span>Total units</span>
            <strong>{computed.totalUnits}</strong>
            <small>Sum of all credit units across completed semesters.</small>
          </article>
          <article className={styles.totalCard}>
            <span>Formula used</span>
            <strong>
              {computed.totalUnits
                ? `${computed.totalQualityPoints} / ${computed.totalUnits}`
                : "Add courses"}
            </strong>
            <small>Total quality points divided by total units.</small>
          </article>
        </div>

        <div className={styles.breakdownGrid}>
          {computed.semesters.map((semester) => (
            <article key={semester.id}>
              <span>{semester.sessionLabel || "Unnamed session"}</span>
              <strong>
                {semester.completeRows.length
                  ? semester.roundedGpa.toFixed(2)
                  : "0.00"}
              </strong>
              <small>
                {semester.semesterLabel || "Unnamed semester"} -{" "}
                {semester.totalUnits} units - {semester.totalQualityPoints} quality
                points
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>02</span>
          <div>
            <h3>Grade bands and class bands</h3>
            <p>These are the exact ranges currently used in this calculator.</p>
          </div>
        </div>

        <div className={styles.bandGrid}>
          <article>
            <h4>Grade points</h4>
            <ul className={styles.bandList}>
              {gradeBands.map((band) => (
                <li key={band.letter}>
                  {band.min} - {band.max} = {band.letter} ({band.points} point
                  {band.points === 1 ? "" : "s"}) - {band.meaning}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h4>Class of degree guide</h4>
            <ul className={styles.bandList}>
              <li>First Class Division: 4.50 - 5.00</li>
              <li>Second Class Upper Division: 3.50 - 4.49</li>
              <li>Second Class Lower Division: 2.40 - 3.49</li>
              <li>Third Class Division: 1.50 - 2.39</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>03</span>
          <div>
            <h3>Worked example from your note</h3>
            <p>
              This still follows the same calculation path, even when you add
              more semesters.
            </p>
          </div>
        </div>

        <div className={styles.exampleGrid}>
          <article className={styles.guideCard}>
            <span>Step 1</span>
            <h3>Convert score to grade point</h3>
            <p className={styles.exampleIntro}>
              Example: `GST 105` scored `71`, so it falls into `A`, which is `5
              points`.
            </p>
            <ul className={styles.exampleList}>
              <li>`ENG 114` 56 = C = 3 points</li>
              <li>`GST 105` 71 = A = 5 points</li>
              <li>`MAC 324` 45 = D = 2 points</li>
            </ul>
          </article>
          <article className={styles.guideCard}>
            <span>Step 2</span>
            <h3>Multiply units by points</h3>
            <p className={styles.exampleIntro}>
              Example: `3 units x 5 points = 15 quality points`.
            </p>
            <ul className={styles.exampleList}>
              <li>`ENG 114` = 2 x 3 = 6</li>
              <li>`GST 105` = 3 x 5 = 15</li>
              <li>`FMC 224` = 2 x 5 = 10</li>
            </ul>
          </article>
          <article className={styles.guideCard}>
            <span>Step 3</span>
            <h3>Add the quality points</h3>
            <p>For the full example, the total quality points become `66`.</p>
          </article>
          <article className={styles.guideCard}>
            <span>Step 4</span>
            <h3>Divide by total units</h3>
            <p>`66 / 18 = 3.666`, which rounds to `3.66`.</p>
          </article>
        </div>
      </section>

      <section className={styles.guideCard}>
        <span>Use it well</span>
        <h3>What this calculator can and cannot do</h3>
        <p>
          This tool helps you estimate semester GPA and cumulative CGPA from the
          scores and units you enter across several semesters. It does not
          connect to your NOUN portal, verify official grades, or decide your
          final academic standing. Always compare the final outcome with your
          official result record.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/results">
            <strong>Results guides</strong>
            <span>Check results, statements, and grade issues.</span>
          </Link>
          <Link href="/articles/how-to-check-noun-results">
            <strong>How to check NOUN results</strong>
            <span>Use the right pages before you rely on any score.</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
