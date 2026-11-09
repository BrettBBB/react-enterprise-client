import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { lazy, Suspense, useState } from 'react';
import { apiUrl } from '../api/client.ts';
import { LoginPage } from '../auth/LoginPage.tsx';
import { useAuth } from '../auth/auth-context.ts';
import { ContactPage } from '../contact/ContactPage.tsx';
import { HomePage } from '../home/HomePage.tsx';
import { SessionInspector } from './SessionInspector.tsx';
import './AppShell.css';

const UsersPage = lazy(() =>
  import('../users/UsersPage.tsx').then((module) => ({ default: module.UsersPage })),
);
const RulesPage = lazy(() =>
  import('../rules/RulesPage.tsx').then((module) => ({ default: module.RulesPage })),
);
const ClaimsPage = lazy(() =>
  import('../claims/ClaimsPage.tsx').then((module) => ({ default: module.ClaimsPage })),
);
const ProcedureCodesPage = lazy(() =>
  import('../reference/ReferencePages.tsx').then((module) => ({ default: module.ProcedureCodesPage })),
);
const DiagnosisCodesPage = lazy(() =>
  import('../reference/ReferencePages.tsx').then((module) => ({ default: module.DiagnosisCodesPage })),
);
const ProcedureRulesPage = lazy(() =>
  import('../procedure-rules/ProcedureRulesPage.tsx').then((module) => ({ default: module.ProcedureRulesPage })),
);
const DiagnosisRulesPage = lazy(() =>
  import('../diagnosis-rules/DiagnosisRulesPage.tsx').then((module) => ({ default: module.DiagnosisRulesPage })),
);

const copyrightYear = new Date().getFullYear();

const pages = [
  { id: 'home', label: 'Home', icon: <HomeOutlinedIcon /> },
  { id: 'users', label: 'Users', icon: <PeopleOutlinedIcon /> },
  { id: 'contact', label: 'Contact', icon: <MailOutlinedIcon /> },
] as const;

const catalogPages = [
  { id: 'procedures', label: 'Procedures' },
  { id: 'diagnoses', label: 'Diagnoses' },
  { id: 'rules', label: 'Claim Rules' },
  { id: 'procedureRules', label: 'Procedure rules' },
  { id: 'diagnosisRules', label: 'Diagnosis rules' },
  { id: 'claims', label: 'Claims' },
] as const;

const catalogViews = {
  procedures: ProcedureCodesPage,
  diagnoses: DiagnosisCodesPage,
  rules: RulesPage,
  procedureRules: ProcedureRulesPage,
  diagnosisRules: DiagnosisRulesPage,
  claims: ClaimsPage,
} as const;

type PageId = (typeof pages)[number]['id'] | (typeof catalogPages)[number]['id'];

function catalogSelection(page: PageId) {
  return catalogPages.find((item) => item.id === page);
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<PageId>('home');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const catalog = catalogSelection(page);
  const needsAuth = !user && (showSignIn || page === 'users' || catalog !== undefined);
  const current = pages.find((item) => item.id === page) ?? pages[0];
  const canManageUsers = user?.isAdmin === true;

  function toggleCatalog() {
    setCatalogOpen((open) => {
      if (!open) {
        setPage((currentPage) => (catalogSelection(currentPage) ? currentPage : 'procedures'));
      }
      return !open;
    });
  }

  function signOut() {
    setShowSignIn(false);
    setCatalogOpen(false);
    setPage('home');
    logout();
  }

  return (
    <div className="app-frame">
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
            {needsAuth ? 'Sign in' : (catalog?.label ?? current.label)}
          </Typography>
          <Typography className="app-account-name">
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </Typography>
          {user ? (
            <Button className="app-account-button" color="inherit" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button className="app-account-button" color="inherit" onClick={() => setShowSignIn(true)}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <div className="app-body">
        <Drawer variant="permanent" className="app-drawer">
          <div className="app-sidebar">
            <nav className="app-nav" aria-label="Primary">
              {pages.map((item) => {
                const selected = item.id === page
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="app-nav-item"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => setPage(item.id)}
                  >
                    {item.icon}
                    <span className="app-nav-label">{item.label}</span>
                    {item.id === 'users' ? (
                      <span className="app-nav-badge" aria-hidden="true">
                        RBAC
                      </span>
                    ) : null}
                  </button>
                )
                })}
              <button
                type="button"
                className="app-nav-item app-nav-group"
                aria-expanded={catalogOpen}
                onClick={toggleCatalog}
              >
                <MedicalServicesOutlinedIcon />
                <span className="app-nav-label">Medical Cost Management</span>
              </button>
              {catalogOpen ? (
                <div className="app-subnav">
                  {catalogPages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="app-nav-item app-subnav-item"
                      aria-current={item.id === page ? 'page' : undefined}
                      onClick={() => setPage(item.id)}
                    >
                      <span className="app-nav-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </nav>
            <SessionInspector />
          </div>
        </Drawer>

        <main className="app-main">
          <PageFrame page={page} needsAuth={needsAuth} canManageUsers={canManageUsers} />
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
          <a href="https://github.com/BrettBBB" target="_blank" rel="noreferrer">
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
}: {
  page: PageId;
  needsAuth: boolean;
  canManageUsers: boolean;
}) {
  if (needsAuth) {
    return <LoginPage />;
  }

  if (page === 'home') {
    return <HomePage />;
  }

  if (page === 'contact') {
    return <ContactPage />;
  }

  const catalog = catalogSelection(page);
  if (catalog) {
    if (!canManageUsers) {
      return (
        <Typography className="app-limited" color="text.secondary">
          The catalog is limited to administrators.
        </Typography>
      );
    }

    const Page = catalogViews[catalog.id];
    return (
      <Suspense fallback={<Typography component="p">Loading catalog…</Typography>}>
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
    <Suspense fallback={<Typography component="p">Loading directory…</Typography>}>
      <UsersPage />
    </Suspense>
  );
}
