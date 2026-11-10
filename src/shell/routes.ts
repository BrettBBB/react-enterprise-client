export const paths = {
  home: "/",
  users: "/users",
  contact: "/contact",
  signIn: "/sign-in",
  overview: "/medical-cost-control/overview",
  procedures: "/medical-cost-control/procedures",
  procedureRules: "/medical-cost-control/procedure-rules",
  diagnoses: "/medical-cost-control/diagnoses",
  diagnosisRules: "/medical-cost-control/diagnosis-rules",
  claims: "/medical-cost-control/claims",
  claimRules: "/medical-cost-control/claim-rules",
} as const;

export const medicalCostControlPages = [
  { path: paths.overview, label: "Overview" },
  { path: paths.procedures, label: "Procedures" },
  { path: paths.procedureRules, label: "Procedure rules" },
  { path: paths.diagnoses, label: "Diagnoses" },
  { path: paths.diagnosisRules, label: "Diagnosis rules" },
  { path: paths.claims, label: "Claims" },
  { path: paths.claimRules, label: "Claim Rules" },
] as const;

const titles: Record<string, string> = {
  [paths.home]: "Home",
  [paths.users]: "Users",
  [paths.contact]: "Contact",
  [paths.signIn]: "Sign in",
  [paths.overview]: "Medical Cost Control | Overview",
  [paths.procedures]: "Medical Cost Control | Procedures",
  [paths.procedureRules]: "Medical Cost Control | Procedure rules",
  [paths.diagnoses]: "Medical Cost Control | Diagnoses",
  [paths.diagnosisRules]: "Medical Cost Control | Diagnosis rules",
  [paths.claims]: "Medical Cost Control | Claims",
  [paths.claimRules]: "Medical Cost Control | Claim Rules",
};

export function titleForPath(pathname: string) {
  return titles[pathname] ?? "Home";
}
