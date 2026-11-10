export const paths = {
  home: "/",
  users: "/users",
  contact: "/contact",
  signIn: "/sign-in",
  overview: "/medical-cost-control/overview",
  procedures: "/medical-cost-control/procedures",
  diagnoses: "/medical-cost-control/diagnoses",
  claimRules: "/medical-cost-control/claim-rules",
  procedureRules: "/medical-cost-control/procedure-rules",
  diagnosisRules: "/medical-cost-control/diagnosis-rules",
  claims: "/medical-cost-control/claims",
} as const;

export const medicalCostControlSectionPaths = {
  procedures: paths.procedures,
  diagnoses: paths.diagnoses,
  claimRules: paths.claimRules,
  procedureRules: paths.procedureRules,
  diagnosisRules: paths.diagnosisRules,
  claims: paths.claims,
} as const;

const titles: Record<string, string> = {
  [paths.home]: "Home",
  [paths.users]: "Users",
  [paths.contact]: "Contact",
  [paths.signIn]: "Sign in",
  [paths.overview]: "Overview",
  [paths.procedures]: "Procedures",
  [paths.diagnoses]: "Diagnoses",
  [paths.claimRules]: "Claim Rules",
  [paths.procedureRules]: "Procedure rules",
  [paths.diagnosisRules]: "Diagnosis rules",
  [paths.claims]: "Claims",
};

export function titleForPath(pathname: string) {
  return titles[pathname] ?? "Home";
}
