export type ProgrammeCourse = {
  code: string;
  title: string;
  units: 1 | 2 | 3 | 4 | 6;
  status: "C" | "E";
};

export type Programme = {
  id: string;
  department: string;
  name: string;
  studyLevel: "undergraduate";
  source: string;
  curriculum: Record<string, Record<"1" | "2", ProgrammeCourse[]>>;
};

export const programmes: Programme[] = [
  {
    id: "b-sc-information-technology",
    department: "Faculty of Computing",
    name: "B.Sc. Information Technology",
    studyLevel: "undergraduate",
    source: "https://foc.nou.edu.ng/b-sc-information-technology/",
    curriculum: {
      "100": {
        "1": [
          { code: "GST101", title: "Use of English and Communication Skills I", units: 2, status: "C" },
          { code: "GST103", title: "Computer Fundamentals", units: 2, status: "C" },
          { code: "GST107", title: "The Study Guide for the Distance Learner", units: 2, status: "C" },
          { code: "CIT143", title: "Introduction to Data Organization and Management", units: 2, status: "C" },
          { code: "BIO101", title: "General Biology I", units: 2, status: "C" },
          { code: "CHM101", title: "Introductory Inorganic Chemistry", units: 2, status: "C" },
          { code: "MTH101", title: "Elementary Mathematics I", units: 3, status: "C" },
          { code: "MTH103", title: "Elementary Mathematics III", units: 3, status: "C" },
          { code: "CIT191", title: "Computer Laboratory I", units: 1, status: "C" },
          { code: "PHY101", title: "Elementary Mechanics, Heat and Properties of Matter", units: 2, status: "C" },
          { code: "CHM191", title: "Introductory Practical Chemistry I", units: 1, status: "C" },
          { code: "PHY191", title: "Introductory Practical Physics I", units: 1, status: "C" },
          { code: "BIO191", title: "General Practical Biology I", units: 1, status: "C" },
        ],
        "2": [
          { code: "GST102", title: "Use of English and Communication Skills II", units: 2, status: "C" },
          { code: "GST104", title: "Use of Library", units: 2, status: "C" },
          { code: "MTH102", title: "Elementary Mathematics II", units: 3, status: "C" },
          { code: "CIT108", title: "Introduction to Problem Solving", units: 3, status: "C" },
          { code: "CIT104", title: "Introduction to Computer Science", units: 2, status: "C" },
          { code: "PHY102", title: "Electricity, Magnetism and Modern Physics", units: 3, status: "C" },
          { code: "STT102", title: "Introductory Statistics", units: 2, status: "E" },
        ],
      },
      "200": {
        "1": [
          { code: "GST201", title: "Nigerian Peoples and Cultures", units: 2, status: "C" },
          { code: "GST203", title: "Introduction to Philosophy and Logic", units: 2, status: "C" },
          { code: "CIT211", title: "Introduction to Operating Systems", units: 3, status: "C" },
          { code: "CIT215", title: "Introduction to Programming Languages", units: 3, status: "C" },
          { code: "CIT237", title: "Programming and Algorithms", units: 3, status: "C" },
          { code: "MTH211", title: "Introduction to Set Theory and Abstract Algebra", units: 3, status: "E" },
          { code: "MTH213", title: "Numerical Analysis I", units: 3, status: "E" },
          { code: "MTH281", title: "Mathematical Methods I", units: 3, status: "E" },
        ],
        "2": [
          { code: "GST202", title: "Fundamentals of Peace Studies and Conflict Resolution", units: 2, status: "C" },
          { code: "GST204", title: "Entrepreneurship and Innovation", units: 2, status: "C" },
          { code: "CIT208", title: "Information Systems", units: 2, status: "C" },
          { code: "CIT212", title: "Systems Analysis and Design", units: 3, status: "C" },
          { code: "CIT236", title: "Analog and Digital Electronics", units: 3, status: "C" },
          { code: "CIT292", title: "Computer Laboratory II", units: 2, status: "C" },
          { code: "MTH212", title: "Linear Algebra II", units: 3, status: "E" },
          { code: "MTH232", title: "Elementary Differential Equations", units: 3, status: "E" },
          { code: "MTH282", title: "Mathematical Methods II", units: 3, status: "E" },
          { code: "PHY208", title: "Network Analysis and Devices", units: 3, status: "E" },
        ],
      },
      "300": {
        "1": [
          { code: "CIT303", title: "Principles of Communication Technology", units: 3, status: "C" },
          { code: "CIT305", title: "Networking and Communication Technology", units: 3, status: "C" },
          { code: "CIT309", title: "Computer Architecture", units: 3, status: "C" },
          { code: "CIT315", title: "Operating System II", units: 3, status: "C" },
          { code: "CIT353", title: "Introduction to Human Computer Interaction", units: 2, status: "C" },
          { code: "CIT216", title: "Fundamentals of Data Structures", units: 3, status: "E" },
          { code: "CIT371", title: "Introduction to Computer Graphics and Animation", units: 3, status: "E" },
          { code: "CIT389", title: "Industrial Training / SIWES", units: 6, status: "C" },
        ],
        "2": [
          { code: "GST302", title: "Business Creation and Growth", units: 2, status: "C" },
          { code: "CIT342", title: "Formal Languages and Automata Theory", units: 3, status: "C" },
          { code: "CIT344", title: "Introduction to Computer Design", units: 3, status: "C" },
          { code: "CIT314", title: "Computer Architecture II", units: 3, status: "C" },
          { code: "CIT302", title: "Data Mining and Data Warehousing", units: 3, status: "C" },
          { code: "CIT364", title: "Management Information Systems", units: 2, status: "C" },
          { code: "CIT332", title: "Survey of Programming Languages", units: 3, status: "E" },
        ],
      },
      "400": {
        "1": [
          { code: "CIT403", title: "Seminar on Emerging Technologies", units: 3, status: "C" },
          { code: "CIT411", title: "Microcomputers and Microprocessors", units: 2, status: "C" },
          { code: "CIT415", title: "Introduction to E-commerce", units: 3, status: "E" },
          { code: "CIT427", title: "Database Systems and Management", units: 3, status: "C" },
          { code: "CIT423", title: "Computer Networks and Communication", units: 3, status: "C" },
          { code: "CIT421", title: "Net-Centric Computing", units: 3, status: "C" },
          { code: "CIT463", title: "Introduction to Multimedia Technology", units: 3, status: "C" },
        ],
        "2": [
          { code: "CIT425", title: "Operations Research", units: 3, status: "C" },
          { code: "CIT474", title: "Introduction to Expert Systems", units: 2, status: "C" },
          { code: "CIT478", title: "Artificial Intelligence", units: 2, status: "E" },
          { code: "CIT484", title: "Website Design and Programming", units: 3, status: "E" },
          { code: "CIT410", title: "Introduction to Cyber-Security", units: 2, status: "E" },
          { code: "CIT499", title: "Project", units: 6, status: "C" },
        ],
      },
    },
  },
  {
    id: "b-sc-mathematics",
    department: "Faculty of Sciences",
    name: "B.Sc. Mathematics",
    studyLevel: "undergraduate",
    source: "https://fos.nou.edu.ng/b-sc-mathematics/",
    curriculum: {
      "100": {
        "1": [
          { code: "BIO101", title: "General Biology I", units: 2, status: "C" },
          { code: "BIO191", title: "General Biology Practical I", units: 1, status: "C" },
          { code: "CHM101", title: "Introductory Inorganic Chemistry", units: 2, status: "C" },
          { code: "CHM103", title: "Introductory Physical Chemistry", units: 2, status: "C" },
          { code: "CHM191", title: "Introductory Practical Chemistry I", units: 1, status: "C" },
          { code: "CIT104", title: "Introduction to Computer Science", units: 2, status: "C" },
          { code: "MTH101", title: "Elementary Mathematics I", units: 3, status: "C" },
          { code: "MTH103", title: "Elementary Mathematics II", units: 3, status: "C" },
          { code: "PHY101", title: "Elementary Mechanics, Heat and Properties of Matter", units: 2, status: "C" },
          { code: "PHY191", title: "Introductory Practical Physics I", units: 1, status: "C" },
          { code: "GST101", title: "Use of English and Communication Skills", units: 2, status: "C" },
          { code: "GST107", title: "The Good Study Guide", units: 2, status: "C" },
        ],
        "2": [
          { code: "BIO102", title: "General Biology II", units: 2, status: "C" },
          { code: "BIO192", title: "General Biology Practical II", units: 1, status: "C" },
          { code: "CIT102", title: "Software Application Skills", units: 2, status: "C" },
          { code: "CHM102", title: "Introductory Organic Chemistry", units: 2, status: "C" },
          { code: "CHM192", title: "Introductory Practical Chemistry II", units: 1, status: "C" },
          { code: "MTH102", title: "Elementary Mathematics II", units: 3, status: "C" },
          { code: "STT102", title: "Introductory Statistics", units: 2, status: "C" },
          { code: "PHY102", title: "Electricity, Magnetism and Modern Physics", units: 3, status: "C" },
          { code: "PHY192", title: "Introductory Physics Laboratory II", units: 1, status: "C" },
          { code: "GST102", title: "Use of English and Communication Skills II", units: 2, status: "C" },
        ],
      },
    },
  },
];

export const departments = [...new Set(programmes.map((programme) => programme.department))];
