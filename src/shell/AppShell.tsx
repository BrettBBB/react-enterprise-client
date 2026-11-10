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
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ArchitectureAssistant } from "../assistant/ArchitectureAssistant.tsx";
import { apiUrl } from "../api/client.ts";
import { useAuth } from "../auth/auth-context.ts";
import { LoginPage } from "../auth/LoginPage.tsx";
import { ContactPage } from "../contact/ContactPage.tsx";
import { HomePage } from "../home/HomePage.tsx";
import { OverviewPage } from "../medical-cost-control/overview/OverviewPage.tsx";
import "./AppShell.css";
import { medicalCostControlPages, paths, titleForPath } from "./routes.ts";
import { SessionInspector } from "./SessionInspector.tsx";

const UsersPage = lazy(() =>
  import("../users/UsersPage.tsx").then((module) => ({
    default: module.UsersPage,
  })),
);
const ClaimRulesPage = lazy(() =>
  import("../medical-cost-control/claim-rules/RulesPage.tsx").then(
    (module) => ({
      default: module.RulesPage,
    }),
  ),
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
  import("../medical-cost-control/procedure-rules/ProcedureRulesPage.tsx").then(
    (module) => ({
      default: module.ProcedureRulesPage,
    }),
  ),
);
const DiagnosisRulesPage = lazy(() =>
  import("../medical-cost-control/diagnosis-rules/DiagnosisRulesPage.tsx").then(
    (module) => ({
      default: module.DiagnosisRulesPage,
    }),
  ),
);

const copyrightYear = new Date().getFullYear();

const leadingPages = [
  { path: paths.home, label: "Home", icon: <HomeOutlinedIcon /> },
  {
    path: paths.users,
    label: "Users",
    icon: <PeopleOutlinedIcon />,
    badge: "RBAC",
  },
] as const;

const contactPage = {
  path: paths.contact,
  label: "Contact",
  icon: <MailOutlinedIcon />,
} as const;

function NavItem({
  to,
  label,
  icon,
  badge,
  nested = false,
}: {
  to: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  nested?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end
      className={nested ? "app-nav-item app-subnav-item" : "app-nav-item"}
    >
      {icon}
      <span className="app-nav-label">{label}</span>
      {badge ? (
        <span className="app-nav-badge" aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function MedicalCostPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Typography component="p">Loading Medical Cost Control…</Typography>
      }
    >
      {children}
    </Suspense>
  );
}

function UsersRoute({
  signedIn,
  canManageUsers,
}: {
  signedIn: boolean;
  canManageUsers: boolean;
}) {
  if (!signedIn) {
    return <LoginPage />;
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

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const onMedicalCostPage = location.pathname.startsWith(
    "/medical-cost-control",
  );
  const [medicalCostControlOpen, setMedicalCostControlOpen] =
    useState(onMedicalCostPage);
  const needsAuth =
    !user &&
    (location.pathname === paths.signIn || location.pathname === paths.users);
  const canManageUsers = user?.isAdmin === true;

  useEffect(() => {
    if (onMedicalCostPage) {
      setMedicalCostControlOpen(true);
    }
  }, [onMedicalCostPage]);

  useEffect(() => {
    if (user && location.pathname === paths.signIn) {
      navigate(paths.home, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  function toggleMedicalCostControl() {
    setMedicalCostControlOpen((open) => {
      if (open) {
        return false;
      }
      if (!onMedicalCostPage) {
        navigate(paths.overview);
      }
      return true;
    });
  }

  function signOut() {
    setMedicalCostControlOpen(false);
    logout();
    navigate(paths.home);
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
            {needsAuth ? "Sign in" : titleForPath(location.pathname)}
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
              onClick={() => navigate(paths.signIn)}
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
                <NavItem
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  icon={item.icon}
                  badge={"badge" in item ? item.badge : undefined}
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
                    <NavItem
                      key={item.path}
                      to={item.path}
                      label={item.label}
                      nested
                    />
                  ))}
                </div>
              ) : null}
              <NavItem
                to={contactPage.path}
                label={contactPage.label}
                icon={contactPage.icon}
              />
              <ArchitectureAssistant />
            </nav>
            <SessionInspector />
          </div>
        </Drawer>

        <main className="app-main">
          <Routes>
            <Route path={paths.home} element={<HomePage />} />
            <Route path={paths.contact} element={<ContactPage />} />
            <Route path={paths.signIn} element={<LoginPage />} />
            <Route
              path={paths.users}
              element={
                <UsersRoute
                  signedIn={user != null}
                  canManageUsers={canManageUsers}
                />
              }
            />
            <Route path={paths.overview} element={<OverviewPage />} />
            <Route
              path={paths.procedures}
              element={
                <MedicalCostPage>
                  <ProcedureCodesPage />
                </MedicalCostPage>
              }
            />
            <Route
              path={paths.procedureRules}
              element={
                <MedicalCostPage>
                  <ProcedureRulesPage />
                </MedicalCostPage>
              }
            />
            <Route
              path={paths.diagnoses}
              element={
                <MedicalCostPage>
                  <DiagnosisCodesPage />
                </MedicalCostPage>
              }
            />
            <Route
              path={paths.diagnosisRules}
              element={
                <MedicalCostPage>
                  <DiagnosisRulesPage />
                </MedicalCostPage>
              }
            />
            <Route
              path={paths.claims}
              element={
                <MedicalCostPage>
                  <ClaimsPage />
                </MedicalCostPage>
              }
            />
            <Route
              path={paths.claimRules}
              element={
                <MedicalCostPage>
                  <ClaimRulesPage />
                </MedicalCostPage>
              }
            />
            <Route
              path="/medical-cost-control"
              element={<Navigate to={paths.overview} replace />}
            />
            <Route path="*" element={<Navigate to={paths.home} replace />} />
          </Routes>
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
