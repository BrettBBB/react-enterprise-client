import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useEffect, useState } from 'react'
import { readAccessToken } from '../api/session.ts'
import { decodeAccessToken, formatRemaining, type AccessClaims } from '../auth/jwt-claims.ts'
import { useAuth } from '../auth/auth-context.ts'

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) {
      return
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active])

  return now
}

export function SessionInspector() {
  const { user } = useAuth()
  const claims = user ? decodeAccessToken(readAccessToken() ?? '') : null
  const now = useNow(claims !== null)
  const remaining = claims ? claims.exp * 1000 - now : 0

  return (
    <section className="app-inspector" aria-label="Auth and session inspector">
      <div className="app-inspector-heading">
        <ShieldOutlinedIcon className="app-inspector-icon" aria-hidden />
        <div>
          <h2 className="app-inspector-title">Auth &amp; Session Inspector</h2>
          <p className="app-inspector-label">Live JWT payload &amp; RBAC claim decoder</p>
        </div>
      </div>
      {user && claims ? (
        <SignedInClaims claims={claims} remaining={remaining} />
      ) : (
        <GuestClaims />
      )}
    </section>
  )
}

function GuestClaims() {
  return (
    <>
      <span className="app-pill app-pill-danger">401 Unauthenticated</span>
      <p className="app-inspector-copy">
        Sign in to receive a JWT. The token is issued with the subject, email, and admin claim that later role checks read.
      </p>
    </>
  )
}

function SignedInClaims({ claims, remaining }: { claims: AccessClaims; remaining: number }) {
  const expired = remaining <= 0

  return (
    <>
      <div className="app-pills">
        <span className="app-pill app-pill-ok">Stateless</span>
        <span className={claims.role === 'admin' ? 'app-pill app-pill-admin' : 'app-pill app-pill-user'}>
          {claims.role}
        </span>
        <span className={claims.isAdmin ? 'app-pill app-pill-ok' : 'app-pill app-pill-user'}>
          {claims.isAdmin ? 'isAdmin' : 'member'}
        </span>
      </div>
      <dl className="app-claims">
        <div>
          <dt>sub</dt>
          <dd title={claims.sub}>{claims.sub}</dd>
        </div>
        <div>
          <dt>email</dt>
          <dd title={claims.email}>{claims.email}</dd>
        </div>
        <div>
          <dt>role</dt>
          <dd>{claims.role}</dd>
        </div>
        <div>
          <dt>isAdmin</dt>
          <dd>{claims.isAdmin ? 'true' : 'false'}</dd>
        </div>
        <div>
          <dt>exp</dt>
          <dd>{expired ? 'Expired' : formatRemaining(remaining)}</dd>
        </div>
      </dl>
      <p className="app-inspector-copy">
        Permissions evaluate from the payload. Role changes take effect on the next sign-in.
      </p>
    </>
  )
}
