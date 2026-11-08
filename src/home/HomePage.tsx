import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import CodeIcon from "@mui/icons-material/Code";
import GitHubIcon from "@mui/icons-material/GitHub";
import StorageIcon from "@mui/icons-material/Storage";
import { Card, CardContent, Chip, Divider } from "@mui/material";

import portrait from "../assets/Brett-Stylized2.jpg";
import { useAuth } from "../auth/auth-context.ts";
import "./HomePage.css";

const pipeline = [
  {
    title: "GitHub",
    copy: "The client and the API live in their own repositories. A push is the release candidate. Render is connected to GitHub, so production builds from that commit.",
  },
  {
    title: "Render",
    copy: "Render installs dependencies, generates the Prisma client, and compiles the NestJS API. The service starts from that build. The browser origin is configured on the API, so only the deployed client is allowed to call it.",
  },
  {
    title: "Neon",
    copy: "Production data is Neon Postgres. The running API uses the pooled connection. Schema changes are applied with Prisma’s deploy command on the direct connection, using the same migration history as local development.",
  },
] as const;

function RepoLink({ href, name }: { href: string; name: string }) {
  return (
    <a className="home-repo" href={href} target="_blank" rel="noreferrer">
      <GitHubIcon className="home-repo-icon" aria-hidden />
      {name}
    </a>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const name = user ? `${user.firstName} ${user.lastName}` : "Guest";

  return (
    <div className="home-page">
      <div>
        <div className="home-heading-row">
          <ArchitectureIcon className="home-hero-icon" color="primary" />
          <h1 className="home-title">Welcome, {name}</h1>
        </div>
        <p className="home-lead text-secondary">
          This application is how I show lead full-stack work: a typed React
          client, a NestJS API, and a production path from GitHub through Render
          to Neon Postgres. Sign-in issues a 15-minute access token and a 7-day
          HttpOnly refresh cookie. When a request receives a 401, the client
          renews the access token in the background, and role-based access uses
          the admin claim. Guests can read this page. An administrator
          can open the user directory, where every page, sort, and filter is
          requested from the API.
        </p>
        <div className="home-byline">
          <img
            className="home-byline-photo"
            src={portrait}
            alt="Brett Brinkhoff"
          />
          <p className="home-byline-name">Brett Brinkhoff</p>
        </div>
      </div>

      <Divider />

      <div className="home-section">
        <h2 className="home-section-title">The product</h2>

        <div className="home-cards">
          <Card className="home-card" variant="outlined">
            <CardContent className="home-card-body">
              <div className="home-card-heading">
                <CodeIcon color="primary" />
                <h3 className="home-card-title">Client</h3>
              </div>
              <p className="home-card-copy text-secondary">
                A Vite and React application in TypeScript, using Material UI.
                The session keeps the signed-in profile and the short-lived
                access token, and sends that token with each API request. A 401
                exchanges the refresh cookie for a new access token and retries
                the request. The admin claim decides who can view and edit users.
              </p>
              <div className="home-chips">
                <Chip label="React" size="small" variant="outlined" />
                <Chip label="TypeScript" size="small" variant="outlined" />
                <Chip label="Vite" size="small" variant="outlined" />
                <Chip label="MUI" size="small" variant="outlined" />
              </div>
              <RepoLink
                href="https://github.com/BrettBBB/react-enterprise-client"
                name="react-enterprise-client"
              />
            </CardContent>
          </Card>

          <Card className="home-card" variant="outlined">
            <CardContent className="home-card-body">
              <div className="home-card-heading">
                <StorageIcon color="primary" />
                <h3 className="home-card-title">API</h3>
              </div>
              <p className="home-card-copy text-secondary">
                A NestJS API built as ECMAScript modules. DTO validation checks
                every request and rejects fields the contract does not declare.
                Registration cannot set the admin role. An administrator sets it
                when editing a user. Passwords are stored as scrypt hashes.
                Sign-in returns the access token in the response and sets the
                refresh token as an HttpOnly cookie. Each renewal extends that
                cookie for seven days of activity. Listing or changing users
                requires an administrator access token, and OpenAPI publishes
                the contract.
              </p>
              <div className="home-chips">
                <Chip label="NestJS" size="small" variant="outlined" />
                <Chip label="Prisma" size="small" variant="outlined" />
                <Chip label="PostgreSQL" size="small" variant="outlined" />
                <Chip label="JWT" size="small" variant="outlined" />
                <Chip label="Refresh cookie" size="small" variant="outlined" />
                <Chip label="RBAC" size="small" variant="outlined" />
              </div>
              <RepoLink
                href="https://github.com/BrettBBB/nest-enterprise-api"
                name="nest-enterprise-api"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="home-section">
        <div className="home-heading-row">
          <AccountTreeIcon color="primary" />
          <h2 className="home-section-title">From a push to production</h2>
        </div>
        <p className="home-lead text-secondary">
          Application code and database schema each have a deliberate path.
          GitHub holds the source, Render ships the build, and Neon holds the
          data.
        </p>
        <ol className="home-steps">
          {pipeline.map((step, index) => (
            <li className="home-step" key={step.title}>
              <span className="home-step-index">{index + 1}</span>
              <div>
                <h3 className="home-step-title">{step.title}</h3>
                <p className="home-step-copy text-secondary">{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="home-chips">
          <Chip label="GitHub" size="small" variant="outlined" />
          <Chip label="Render" size="small" variant="outlined" />
          <Chip label="Neon" size="small" variant="outlined" />
          <Chip label="Prisma Migrate" size="small" variant="outlined" />
        </div>
      </div>
    </div>
  );
}
