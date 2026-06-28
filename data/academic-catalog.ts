export type FacultyCatalog = {
  name: string;
  programmes: string[];
};

// Phase-one academic catalog extracted from the public Puredu faculty/programme
// endpoint. Each programme must still be reconciled against current NOUN records.
export const academicCatalog: FacultyCatalog[] = [
  {
    name: "Faculty of Agriculture",
    programmes: [
      "B.Agric Agricultural Economics and Agro-Business",
      "B.Agric Agricultural Extension and Rural Development",
      "B.Agric Animal Science",
      "B.Agric Crop Science",
      "B.Agric Soil and Land Resources Management",
      "PGD Agricultural Extension Management",
    ],
  },
  {
    name: "Faculty of Arts",
    programmes: [
      "B.A. Arabic", "B.A. Christian Theology", "B.A. English", "B.A. French",
      "B.A. Hausa", "B.A. Igbo", "B.A. Islamic Studies", "B.A. Philosophy",
      "B.A. Yoruba", "PGD Christian Theology", "M.A. Islamic Studies",
      "M.A. English (Language)", "M.A. English (Literature in English)",
      "M.A. English (Comparative Literature)",
      "M.A. Christian Religious Studies (Old Testament)",
      "M.A. Christian Religious Studies (New Testament)",
      "M.A. Christian Religious Studies (Church History)",
      "M.A. Christian Religious Studies (Philosophy of Religion)",
      "M.A. Christian Religious Studies (African Traditional Religion)",
      "M.A. Christian Religious Studies (Systematic Theology)",
      "M.A. Christian Religious Studies (Pastoral Theology)",
    ],
  },
  {
    name: "Faculty of Computing",
    programmes: [
      "B.Sc. Computer Science", "B.Sc. Information Technology",
      "B.Sc. Cyber Security", "PGD Information Technology",
      "M.Sc. Information Technology",
    ],
  },
  {
    name: "Faculty of Education",
    programmes: [
      "B.A.(Ed.) Early Childhood Education", "B.A.(Ed.) English",
      "B.A.(Ed.) French", "B.A.(Ed.) Primary Education",
      "B.LIS Library and Information Science", "B.Sc.(Ed.) Agricultural Science",
      "B.Sc.(Ed.) Biology", "B.Sc.(Ed.) Business Education",
      "B.Sc.(Ed.) Chemistry", "B.Sc.(Ed.) Computer Science",
      "B.Sc.(Ed.) Health Education", "B.Sc.(Ed.) Human Kinetics",
      "B.Sc.(Ed.) Integrated Science", "B.Sc.(Ed.) Mathematics",
      "B.Sc.(Ed.) Physics", "M.Ed. Educational Technology",
      "M.Ed. Science Education", "PGD Education",
      "M.Ed. Administration and Planning", "M.Ed. Guidance and Counselling",
    ],
  },
  {
    name: "Faculty of Health Sciences",
    programmes: [
      "B.NSc. Nursing Science", "B.Sc. Environmental Health Science",
      "B.Sc. Public Health", "M.Sc. Public Health",
    ],
  },
  {
    name: "Faculty of Law",
    programmes: ["PGD Legislative Drafting", "LL.M. Law"],
  },
  {
    name: "Faculty of Management Sciences",
    programmes: [
      "B.Sc. Accounting", "B.Sc. Banking and Finance",
      "B.Sc. Business Administration", "B.Sc. Cooperative and Rural Development",
      "B.Sc. Entrepreneurship", "B.Sc. Marketing", "B.Sc. Public Administration",
      "PGD Business Administration", "PGD Public Administration",
      "Master of Business Administration", "Master of Public Administration",
      "M.Sc. Business Administration", "M.Sc. Public Administration",
      "PGD Entrepreneurship", "M.Sc. Entrepreneurship",
    ],
  },
  {
    name: "Faculty of Sciences",
    programmes: [
      "B.Sc. Biology", "B.Sc. Chemistry",
      "B.Sc. Environmental Science and Resource Management",
      "B.Sc. Mathematics", "B.Sc. Mathematics and Computer Science",
      "B.Sc. Physics", "M.Sc. Chemistry (Analytical Chemistry)",
      "M.Sc. Chemistry (Environmental Chemistry)",
      "M.Sc. Chemistry (Organic Chemistry)",
    ],
  },
  {
    name: "Faculty of Social Sciences",
    programmes: [
      "B.Sc. Broadcast Journalism", "B.Sc. Criminology and Security Studies",
      "B.Sc. Development Studies", "B.Sc. Economics", "B.Sc. Film Production",
      "B.Sc. International Relations", "B.Sc. Mass Communication",
      "B.Sc. Peace Studies and Conflict Resolution", "B.Sc. Political Science",
      "B.Sc. Tourism Studies", "PGD Economics", "PGD Mass Communication",
      "M.Sc. Mass Communication", "PGD Peace Studies and Conflict Resolution",
      "M.Sc. Peace Studies and Conflict Resolution",
      "PGD Criminology and Security Studies",
      "M.Sc. Criminology and Security Studies",
    ],
  },
];

export const facultyNames = academicCatalog.map((faculty) => faculty.name);

export function slugifyProgramme(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
