export type Course = {
  code: string;
  title: string;
  units: 1 | 2 | 3 | 4;
  level: number;
  semester: 1 | 2;
  faculty: string;
};

// Starter catalog compiled from official NOUN course and programme pages.
// Students should still confirm their registrable curriculum on the portal.
export const courses: Course[] = [
  { code: "GST101", title: "Use of English and Communication Skills I", units: 2, level: 100, semester: 1, faculty: "General Studies" },
  { code: "GST107", title: "A Study Guide for the Distance Learner", units: 2, level: 100, semester: 1, faculty: "General Studies" },
  { code: "GST201", title: "Nigerian Peoples and Cultures", units: 2, level: 200, semester: 1, faculty: "General Studies" },
  { code: "GST202", title: "Fundamentals of Peace Studies and Conflict Resolution", units: 2, level: 200, semester: 2, faculty: "General Studies" },
  { code: "GST302", title: "Business Creation and Growth", units: 2, level: 300, semester: 2, faculty: "General Studies" },
  { code: "CIT101", title: "Computers in Society", units: 2, level: 100, semester: 1, faculty: "Computing" },
  { code: "CIT102", title: "Software Application Skills", units: 2, level: 100, semester: 2, faculty: "Computing" },
  { code: "CIT104", title: "Introduction to Computers", units: 2, level: 100, semester: 2, faculty: "Computing" },
  { code: "CIT141", title: "Information Storage and Retrieval", units: 2, level: 100, semester: 1, faculty: "Computing" },
  { code: "CIT143", title: "Introduction to Data Organisation and Management", units: 2, level: 100, semester: 1, faculty: "Computing" },
  { code: "DAM205", title: "Data Collection Methodology", units: 2, level: 200, semester: 1, faculty: "Computing" },
  { code: "DAM207", title: "Indexing and Classification", units: 2, level: 200, semester: 1, faculty: "Computing" },
  { code: "MTH101", title: "Elementary Mathematics I", units: 3, level: 100, semester: 1, faculty: "Sciences" },
  { code: "MTH103", title: "Elementary Mathematics II", units: 3, level: 100, semester: 1, faculty: "Sciences" },
  { code: "PHY101", title: "Elementary Mechanics, Heat and Properties of Matter", units: 2, level: 100, semester: 1, faculty: "Sciences" },
  { code: "PHY191", title: "Introductory Practical Physics I", units: 1, level: 100, semester: 1, faculty: "Sciences" },
  { code: "BIO102", title: "General Biology II", units: 2, level: 100, semester: 2, faculty: "Sciences" },
  { code: "BIO192", title: "General Biology Practical II", units: 1, level: 100, semester: 2, faculty: "Sciences" },
  { code: "EHS304", title: "Food Hygiene and Safety", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS306", title: "Sanitary Inspection of Premises", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS308", title: "Environmental Biotechnology", units: 3, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS310", title: "Control of Communicable and Noncommunicable Diseases", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS312", title: "Housing and Building Construction", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS314", title: "Environmental Health Services in Emergency Situations", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "EHS318", title: "Water Resources Management", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "PHS318", title: "Principles of Epidemiology", units: 2, level: 300, semester: 1, faculty: "Health Sciences" },
  { code: "ACC313", title: "Management Accounting", units: 3, level: 300, semester: 1, faculty: "Management Sciences" },
  { code: "BUS317", title: "Production Management", units: 3, level: 300, semester: 1, faculty: "Management Sciences" },
  { code: "BFN303", title: "Financial Management", units: 3, level: 300, semester: 1, faculty: "Management Sciences" },
  { code: "MKT303", title: "Consumer Behaviour", units: 3, level: 300, semester: 1, faculty: "Management Sciences" },
  { code: "PAD305", title: "Elements of Government", units: 3, level: 300, semester: 1, faculty: "Social Sciences" },
  { code: "CLL307", title: "Commercial Law", units: 3, level: 300, semester: 1, faculty: "Law" },
  { code: "GST807", title: "A Study Guide for the Distance Learner", units: 2, level: 800, semester: 1, faculty: "Postgraduate Studies" },
  { code: "CIT831", title: "Software Engineering Methodologies", units: 3, level: 800, semester: 1, faculty: "Computing" },
  { code: "CIT841", title: "Advanced Information Systems", units: 3, level: 800, semester: 1, faculty: "Computing" },
  { code: "CIT843", title: "Introduction to Database Management Systems", units: 2, level: 800, semester: 1, faculty: "Computing" },
];
