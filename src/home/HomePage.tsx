import ArchitectureIcon from "@mui/icons-material/Architecture";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import { Card, CardContent, Chip, Divider } from "@mui/material";

import { useAuth } from "../auth/auth-context.ts";

export function HomePage() {
  const { user } = useAuth();
  const name = user ? `${user.firstName} ${user.lastName}` : "Guest";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxWidth: "800px",
      }}
    >
      {/* Welcome & Overview Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <ArchitectureIcon color="primary" style={{ fontSize: "32px" }} />
          <h1
            style={{
              fontSize: "2.125rem",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Welcome, {name}
          </h1>
        </div>
        <p
          style={{
            color: "text.secondary",
            fontSize: "1rem",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Explore this full-stack architecture showcase built with NestJS,
          React, PostgreSQL, and Prisma. The platform highlights contract-first
          API design, runtime type safety, and real-time server-side data grid
          operations.
        </p>
      </div>

      <Divider />

      {/* Technical Highlights Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
          Architectural Core
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Frontend Card */}
          <Card
            variant="outlined"
            sx={{ flex: 1, minWidth: "280px", borderRadius: 2 }}
          >
            <CardContent>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <CodeIcon color="primary" />
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Frontend Engine
                </h3>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.6)",
                  lineHeight: 1.5,
                  marginBottom: "16px",
                }}
              >
                Single-page architecture engineered with Vite, React,
                TypeScript, and Material UI. Features typed state flow and
                dynamic API bindings.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <Chip label="React" size="small" variant="outlined" />
                <Chip label="TypeScript" size="small" variant="outlined" />
                <Chip label="MUI" size="small" variant="outlined" />
                <Chip label="Vite" size="small" variant="outlined" />
              </div>
            </CardContent>
          </Card>

          {/* Backend Card */}
          <Card
            variant="outlined"
            sx={{ flex: 1, minWidth: "280px", borderRadius: 2 }}
          >
            <CardContent>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <StorageIcon color="primary" />
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Backend Service
                </h3>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.6)",
                  lineHeight: 1.5,
                  marginBottom: "16px",
                }}
              >
                Modular NestJS REST API with PostgreSQL, managed through Prisma
                ORM. Built for explicit validation, schema safety, and
                scalability.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
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
