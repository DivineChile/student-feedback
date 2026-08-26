// Matric-number formats accepted across the app.
//
//   Legacy:  2025/HND1/COMP/001   (YEAR / LEVEL / DEPT / NUMBER)
//   New:     FPOG25/HND/NCC/001   (FPOG + 2-digit session / LEVEL / DEPT / NUMBER)
//
// Both formats share one department set. This module is the single source of
// truth for validating and parsing matric numbers — import it instead of
// re-declaring a regex or a department map anywhere else.

export const DEPARTMENTS = {
  COMP: "Computer Science",
  PET: "Petroleum Marketing",
  SLT: "Safety Lab and Technology",
  ISSET: "Industrial Safety",
  BAM: "Business Administration",
  ELECT: "Electrical Electronics",
  NCC: "Networking and Cloud Computing",
  SWD: "Software and Web Development",
};

// The department alternation is derived from DEPARTMENTS so the two can never
// drift apart. Codes are plain letters, so they are regex-safe as-is.
const DEPT_GROUP = Object.keys(DEPARTMENTS).join("|");

// 2025/HND1/COMP/001
export const LEGACY_PATTERN = new RegExp(
  `^(20\\d{2})/(ND1|ND2|HND1|HND2)/(${DEPT_GROUP})/(\\d{3})$`
);

// FPOG25/HND/NCC/001
export const NEW_PATTERN = new RegExp(
  `^FPOG(\\d{2})/(HND|ND)/(${DEPT_GROUP})/(\\d{3})$`
);

// Example string for placeholders and validation error messages.
export const MATRIC_FORMAT_HINT = "2025/HND1/COMP/001 or FPOG25/HND/NCC/001";

export function isValidMatric(matricNumber) {
  const value = (matricNumber || "").trim();
  return LEGACY_PATTERN.test(value) || NEW_PATTERN.test(value);
}

// Returns a unified shape for both formats. On no match, `valid` is false and
// every field is null, so each call site can apply its own fallback label.
export function parseMatric(matricNumber) {
  const value = (matricNumber || "").trim();

  const newMatch = value.match(NEW_PATTERN);
  if (newMatch) {
    const [, year, level, department] = newMatch;
    const admissionYear = `20${year}`;
    return {
      valid: true,
      session: admissionYear,
      admissionYear,
      level,
      department,
      departmentName: DEPARTMENTS[department] || department,
    };
  }

  const legacyMatch = value.match(LEGACY_PATTERN);
  if (legacyMatch) {
    const [, year, level, department] = legacyMatch;
    return {
      valid: true,
      session: year,
      admissionYear: year,
      level,
      department,
      departmentName: DEPARTMENTS[department] || department,
    };
  }

  return {
    valid: false,
    session: null,
    admissionYear: null,
    level: null,
    department: null,
    departmentName: null,
  };
}
