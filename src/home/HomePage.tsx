import ArchitectureIcon from "@mui/icons-material/Architecture";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import { Card, CardContent, Chip, Divider } from "@mui/material";

import { useAuth } from "../auth/auth-context.ts";
import "./HomePage.css";

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
          Explore this full-stack architecture showcase built with NestJS,
          React, PostgreSQL, and Prisma. The platform highlights contract-first
          API design, runtime type safety, and real-time server-side data grid
          operations.
        </p>
      </div>

      <Divider />

      <div className="home-section">
        <h2 className="home-section-title">Architectural Core</h2>

        <div className="home-cards">
          <Card className="home-card" variant="outlined">
            <CardContent>
              <div className="home-card-heading">
                <CodeIcon color="primary" />
                <h3 className="home-card-title">Frontend Engine</h3>
              </div>
              <p className="home-card-copy text-secondary">
                Single-page architecture engineered with Vite, React,
                TypeScript, and Material UI. Features typed state flow and
                dynamic API bindings.
              </p>
              <div className="home-chips">
                <Chip label="React" size="small" variant="outlined" />
                <Chip label="TypeScript" size="small" variant="outlined" />
                <Chip label="MUI" size="small" variant="outlined" />
                <Chip label="Vite" size="small" variant="outlined" />
              </div>
            </CardContent>
          </Card>

          <Card className="home-card" variant="outlined">
            <CardContent>
              <div className="home-card-heading">
                <StorageIcon color="primary" />
                <h3 className="home-card-title">Backend Service</h3>
              </div>
              <p className="home-card-copy text-secondary">
                Modular NestJS REST API with PostgreSQL, managed through Prisma
                ORM. Built for explicit validation, schema safety, and
                scalability.
              </p>
              <div className="home-chips">
                <Chip label="NestJS" size="small" variant="outlined" />
                <Chip label="PostgreSQL" size="small" variant="outlined" />
                <Chip label="Prisma" size="small" variant="outlined" />
                <Chip label="REST API" size="small" variant="outlined" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
