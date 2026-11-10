import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { apiUrl } from "../api/client.ts";
import { LoginPage } from "../auth/LoginPage.tsx";
import { useAuth } from "../auth/auth-context.ts";
import { ContactPage } from "../contact/ContactPage.tsx";
import { HomePage } from "../home/HomePage.tsx";
import {
  OverviewPage,
  type MedicalCostControlSectionId,
} from "../medical-cost-control/OverviewPage.tsx";
import "./AppShell.css";
import { SessionInspector } from "./SessionInspector.tsx";

const UsersPage = lazy(() =>
  import("../users/UsersPage.tsx").then((module) => ({
    default: module.UsersPage,
  })),
);
const RulesPage = lazy(() =>
  import("../medical-cost-control/claim-rules/RulesPage.tsx").then((module) => ({
    default: module.RulesPage,
  })),
);
const ClaimsPage = lazy(() =>
  import("../medical-cost-control/claims/ClaimsPage.tsx").then((module) => ({
    default: module.ClaimsPage,
  })),
);
const ProcedureCodesPage = lazy(() =>
  import("../reference/ReferencePages.tsx").then((module) => ({
    default: module.ProcedureCodesPage,
  })),
);
const DiagnosisCodesPage = lazy(() =>
  import("../reference/ReferencePages.tsx").then((module) => ({
    default: module.DiagnosisCodesPage,
  })),
);
const ProcedureRulesPage = lazy(() =>
  import("../medical-cost-control/procedure-rules/ProcedureRulesPage.tsx").then((module) => ({
    default: module.ProcedureRulesPage,
  })),
);
const DiagnosisRulesPage = lazy(() =>
  import("../medical-cost-control/diagnosis-rules/DiagnosisRulesPage.tsx").then((module) => ({
    default: module.DiagnosisRulesPage,
  })),
);

const copyrightYear = new Date().getFullYear();

const leadingPages = [
  { id: "home", label: "Home", icon: <HomeOutlinedIcon /> },
  { id: "users", label: "Users", icon: <PeopleOutlinedIcon />, badge: "RBAC" },
] as const;

const contactPage = {
  id: "contact",
  label: "Contact",
  icon: <MailOutlinedIcon />,
} as const;

const medicalCostControlPages = [
  { id: "overview", label: "Overview" },
  { id: "procedures", label: "Procedures" },
  { id: "diagnoses", label: "Diagnoses" },
  { id: "rules", label: "Claim Rules" },
  { id: "procedureRules", label: "Procedure rules" },
  { id: "diagnosisRules", label: "Diagnosis rules" },
  { id: "claims", label: "Claims" },
] as const;

const medicalCostControlViews = {
  procedures: ProcedureCodesPage,
  diagnoses: DiagnosisCodesPage,
  rules: RulesPage,
  procedureRules: ProcedureRulesPage,
  diagnosisRules: DiagnosisRulesPage,
  claims: ClaimsPage,
} as const;

type PageId =
  | (typeof leadingPages)[number]["id"]
  | typeof contactPage.id
  | (typeof medicalCostControlPages)[number]["id"];

function medicalCostControlSelection(page: PageId) {
  return medicalCostControlPages.find((item) => item.id === page);
}

function NavButton({
  label,
  icon,
  badge,
  selected,
  nested = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  badge?: string;
  selected: boolean;
  nested?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={nested ? "app-nav-item app-subnav-item" : "app-nav-item"}
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
    >
      {icon}
      <span className="app-nav-label">{label}</span>
      {badge ? (
        <span className="app-nav-badge" aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageId>("home");
  const [medicalCostControlOpen, setMedicalCostControlOpen] =
    useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const medicalCostControl = medicalCostControlSelection(page);
  const needsAuth =
    !user &&
    (showSignIn || page === "users" || medicalCostControl !== undefined);
  const current = leadingPages.find((item) => item.id === page) ?? contactPage;
  const canManageUsers = user?.isAdmin === true;

  function toggleMedicalCostControl() {
    setMedicalCostControlOpen((open) => {
      if (!open) {
        setPage((currentPage) =>
          medicalCostControlSelection(currentPage)
            ? currentPage
            : "overview",
        );
      }
      return !open;
    });
  }

  function signOut() {
    setShowSignIn(false);
    setMedicalCostControlOpen(false);
    setPage("home");
    logout();
  }

  return (
    <div className="app-frame">
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar className="app-toolbar">
          <div className="app-brand">
            <span className="app-brand-mark" aria-hidden="true">
              BB
            </span>
            <span className="app-brand-text">
              <span className="app-brand-name">Brett Brinkhoff</span>
              <span className="app-brand-role">Full-Stack Architect</span>
            </span>
          </div>
          <Typography component="h1" className="app-page-title">
            {needsAuth
              ? "Sign in"
              : (medicalCostControl?.label ?? current.label)}
          </Typography>
          <Typography className="app-account-name">
            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
          </Typography>
          {user ? (
            <Button
              className="app-account-button"
              color="inherit"
              onClick={signOut}
            >
              Sign out
            </Button>
          ) : (
            <Button
              className="app-account-button"
              color="inherit"
              onClick={() => setShowSignIn(true)}
            >
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <div className="app-body">
        <Drawer variant="permanent" className="app-drawer">
          <div className="app-sidebar">
            <nav className="app-nav" aria-label="Primary">
              {leadingPages.map((item) => (
                <NavButton
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  badge={"badge" in item ? item.badge : undefined}
                  selected={item.id === page}
                  onClick={() => setPage(item.id)}
                />
              ))}
              <button
                type="button"
                className="app-nav-item app-nav-group"
                aria-expanded={medicalCostControlOpen}
                onClick={toggleMedicalCostControl}
              >
                <MedicalServicesOutlinedIcon />
                <span className="app-nav-label">Medical Cost Control</span>
              </button>
              {medicalCostControlOpen ? (
                <div className="app-subnav">
                  {medicalCostControlPages.map((item) => (
                    <NavButton
                      key={item.id}
                      label={item.label}
                      nested
                      selected={item.id === page}
                      onClick={() => setPage(item.id)}
                    />
                  ))}
                </div>
              ) : null}
              <NavButton
                label={contactPage.label}
                icon={contactPage.icon}
                selected={page === contactPage.id}
                onClick={() => setPage(contactPage.id)}
              />
            </nav>
            <SessionInspector />
          </div>
        </Drawer>

        <main className="app-main">
          <PageFrame
            page={page}
            needsAuth={needsAuth}
            canManageUsers={canManageUsers}
            onOpenMedicalCostSection={(section) => setPage(section)}
          />
        </main>
      </div>
      <footer className="app-footer">
        <p className="app-footer-copy">© {copyrightYear} Brett Brinkhoff</p>
        <nav className="app-footer-links" aria-label="Footer links">
          <a href={`${apiUrl}/api`} target="_blank" rel="noreferrer">
            <DescriptionOutlinedIcon className="app-footer-icon" aria-hidden />
            API docs
          </a>
          <a
            href="https://www.linkedin.com/in/brett-brinkhoff/"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon className="app-footer-icon" aria-hidden />
            LinkedIn
          </a>
          <a
            href="https://github.com/BrettBBB"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon className="app-footer-icon" aria-hidden />
            GitHub
          </a>
        </nav>
      </footer>
    </div>
  );
}

function PageFrame({
  page,
  needsAuth,
  canManageUsers,
  onOpenMedicalCostSection,
}: {
  page: PageId;
  needsAuth: boolean;
  canManageUsers: boolean;
  onOpenMedicalCostSection: (page: MedicalCostControlSectionId) => void;
}) {
  if (needsAuth) {
    return <LoginPage />;
  }

  if (page === "home") {
    return <HomePage />;
  }

  if (page === "contact") {
    return <ContactPage />;
  }

  const medicalCostControl = medicalCostControlSelection(page);
  if (medicalCostControl) {
    if (medicalCostControl.id === "overview") {
      return <OverviewPage onOpen={onOpenMedicalCostSection} />;
    }

    const Page = medicalCostControlViews[medicalCostControl.id];
    return (
      <Suspense
        fallback={
          <Typography component="p">
            Loading Medical Cost Control…
          </Typography>
        }
      >
        <Page />
      </Suspense>
    );
  }

  if (!canManageUsers) {
    return (
      <Typography className="app-limited" color="text.secondary">
        The user directory is limited to administrators.
      </Typography>
    );
  }

  return (
    <Suspense
      fallback={<Typography component="p">Loading directory…</Typography>}
    >
      <UsersPage />
    </Suspense>
  );
}
