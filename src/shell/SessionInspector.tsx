import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useEffect, useState } from 'react'
import { readAccessToken } from '../api/session.ts'
import { decodeAccessToken, formatLifetime, formatRemaining, type AccessClaims } from '../auth/jwt-claims.ts'
import { useAuth } from '../auth/auth-context.ts'
import { readRefreshExpiresAt } from '../auth/session.ts'

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
  const now = useNow(user !== null)
  const remaining = claims ? claims.exp * 1000 - now : 0
  const refreshExpiresAt = user ? readRefreshExpiresAt() : null
  const refreshRemaining = refreshExpiresAt ? Date.parse(refreshExpiresAt) - now : null

  return (
    <section className="app-inspector" aria-label="Auth and session inspector">
      <div className="app-inspector-heading">
        <ShieldOutlinedIcon className="app-inspector-icon" aria-hidden />
        <div>
          <h2 className="app-inspector-title">Auth &amp; Session Inspector</h2>
          <p className="app-inspector-label">Access token, refresh cookie, and RBAC claims</p>
        </div>
      </div>
      {user && claims ? (
        <SignedInClaims claims={claims} remaining={remaining} refreshRemaining={refreshRemaining} />
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
        Sign in to receive a 15-minute access token. A 7-day HttpOnly refresh cookie stays on the API and renews that token after a 401.
      </p>
    </>
  )
}

function SignedInClaims({
  claims,
  remaining,
  refreshRemaining,
}: {
  claims: AccessClaims
  remaining: number
  refreshRemaining: number | null
}) {
  const expired = remaining <= 0
  const refreshLabel =
    refreshRemaining === null
      ? 'Not issued'
      : refreshRemaining <= 0
        ? 'Expired'
        : formatLifetime(refreshRemaining)

  return (
    <>
      <div className="app-pills">
        <span className="app-pill app-pill-ok">15 min access</span>
        <span className="app-pill app-pill-admin">HttpOnly refresh</span>
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
          <dt>access</dt>
          <dd>{expired ? 'Expired' : formatRemaining(remaining)}</dd>
        </div>
        <div>
          <dt>refresh</dt>
          <dd>{refreshLabel}</dd>
        </div>
      </dl>
      <p className="app-inspector-copy">
        The access token is the bearer header. The refresh token is an HttpOnly cookie, so this page cannot read it. A 401 renews the access token for another 15 minutes and extends the cookie for 7 days of activity. Role changes are picked up on that renewal.
      </p>
    </>
  )
}
