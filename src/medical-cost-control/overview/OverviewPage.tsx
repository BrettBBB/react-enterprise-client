import CodeIcon from '@mui/icons-material/Code'
import StorageIcon from '@mui/icons-material/Storage'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import { Link } from 'react-router-dom'
import { medicalCostControlSectionPaths } from '../../shell/routes.ts'
import './OverviewPage.css'

const sections = [
  {
    id: 'procedures',
    label: 'Procedures',
    description:
      'CPT and HCPCS reference data, including category, RVUs, and standard cost. The grid is read-only. Import Codes replaces the procedure table, then scores every claim again.',
  },
  {
    id: 'diagnoses',
    label: 'Diagnoses',
    description:
      'ICD-10-CM reference data, including category, laterality, and HCC eligibility. The grid is read-only. Import Codes replaces the diagnosis table, then scores every claim again.',
  },
  {
    id: 'rules',
    label: 'Claim Rules',
    description:
      'Billed-amount policy. A claim is marked TRIGGERED when its billed amount meets the rule minimum and any type, category, or code on the rule also matches. Blank fields match every claim. Saving a rule scores every claim outcome again.',
  },
  {
    id: 'procedureRules',
    label: 'Procedure rules',
    description:
      'Standard-cost policy for CPT and HCPCS. A claim is marked TRIGGERED when the matching procedure’s standard cost meets the rule minimum and any type, category, or code also matches. Saving a rule scores every claim again.',
  },
  {
    id: 'diagnosisRules',
    label: 'Diagnosis rules',
    description:
      'ICD-10 policy. A claim is marked TRIGGERED when its diagnosis matches the rule’s code, category, laterality, and HCC requirement. Blank fields match every diagnosis. Saving a rule scores every claim again.',
  },
  {
    id: 'claims',
    label: 'Claims',
    description:
      'The claim register. Each row shows the billed amount, the outcome from claim rules, and the procedure and diagnosis flags. Adding or editing a claim scores that claim.',
  },
] as const

export type MedicalCostControlSectionId = (typeof sections)[number]['id']

export function OverviewPage() {
  return (
    <div className="medical-cost-overview">
      <p className="medical-cost-overview-lead text-secondary">
        Medical Cost Control scores billed claims against procedure and diagnosis reference data.
        The NestJS API stores the codes, the rules, and the claim results. Anyone can read the
        grids. Adding, editing, and deleting stay with an administrator.
      </p>

      <div className="medical-cost-overview-columns">
        <Card className="medical-cost-overview-card" variant="outlined">
          <CardContent className="medical-cost-overview-card-body">
            <div className="medical-cost-overview-heading">
              <StorageIcon color="primary" />
              <h2 className="medical-cost-overview-title">Cost Control API</h2>
            </div>
            <p className="medical-cost-overview-copy text-secondary">
              The API is a NestJS service on PostgreSQL through Prisma. Procedure codes, diagnosis
              codes, claim rules, procedure rules, diagnosis rules, and claims each have their own
              resource. A list request sends one grid query, and Postgres applies the page, sort,
              and filter. Saving a claim looks up the code and stores the billed-amount outcome, the
              procedure flag, and the diagnosis flag. Saving a procedure or diagnosis rule, or
              importing a code file, scores every claim again. Saving a claim rule scores the
              billed-amount outcome. Category menus read the distinct categories. Reading these
              routes is public. Adding, editing, deleting, and importing codes require an administrator.
            </p>
            <div className="medical-cost-overview-chips">
              <Chip label="NestJS" size="small" variant="outlined" />
              <Chip label="Prisma" size="small" variant="outlined" />
              <Chip label="PostgreSQL" size="small" variant="outlined" />
              <Chip label="OpenAPI" size="small" variant="outlined" />
            </div>
          </CardContent>
        </Card>

        <Card className="medical-cost-overview-card" variant="outlined">
          <CardContent className="medical-cost-overview-card-body">
            <div className="medical-cost-overview-heading">
              <CodeIcon color="primary" />
              <h2 className="medical-cost-overview-title">React display</h2>
            </div>
            <p className="medical-cost-overview-copy text-secondary">
              The client is Vite, React, and TypeScript with Material UI. Each section loads on its
              own. The grids are MUI X DataGrid tables. The grid request goes to the API, and the
              table shows the page Postgres returned. Billed-amount filters are converted to cents
              before they leave the browser. Standard cost is sent as the typed dollar amount.
              Category lists load once for the session and clear after a successful import.
            </p>
            <div className="medical-cost-overview-chips">
              <Chip label="React" size="small" variant="outlined" />
              <Chip label="TypeScript" size="small" variant="outlined" />
              <Chip label="Vite" size="small" variant="outlined" />
              <Chip label="MUI X" size="small" variant="outlined" />
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="medical-cost-overview-sections" aria-label="Medical Cost Control sections">
        <h2 className="medical-cost-overview-section-title">Sections</h2>
        <ul className="medical-cost-overview-list">
          {sections.map((section) => (
            <li className="medical-cost-overview-item" key={section.id}>
              <Link className="medical-cost-overview-link" to={medicalCostControlSectionPaths[section.id]}>
                {section.label}
              </Link>
              <p className="medical-cost-overview-copy text-secondary">{section.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
