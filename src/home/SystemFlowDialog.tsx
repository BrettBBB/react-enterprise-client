import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import './SystemFlowDialog.css'

type SystemFlowDialogProps = {
  open: boolean
  onClose: () => void
}

function BlockArrow({ x, y, width, height, direction }: { x: number; y: number; width: number; height: number; direction: 'left' | 'right' }) {
  const head = height * 0.7
  const shaft = height * 0.55
  const mid = y + height / 2
  const shaftTop = mid - shaft / 2
  const shaftBottom = mid + shaft / 2
  const points = direction === 'right'
    ? `${x},${shaftTop} ${x + width - head},${shaftTop} ${x + width - head},${y} ${x + width},${mid} ${x + width - head},${y + height} ${x + width - head},${shaftBottom} ${x},${shaftBottom}`
    : `${x + width},${shaftTop} ${x + head},${shaftTop} ${x + head},${y} ${x},${mid} ${x + head},${y + height} ${x + head},${shaftBottom} ${x + width},${shaftBottom}`
  return <polygon points={points} className="flow-block" />
}

export function SystemFlowDialog({ open, onClose }: SystemFlowDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="system-flow-title">
      <div className="flow-title">
        <DialogTitle id="system-flow-title">System flow</DialogTitle>
        <IconButton aria-label="Close" onClick={onClose} className="flow-close">
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent>
        <div className="flow">
          <svg className="flow-diagram" viewBox="0 0 900 300" role="img" aria-labelledby="flow-diagram-title">
            <title id="flow-diagram-title">Browser requests to the React client and NestJS API, with Neon, Resend, and Observe</title>
            <defs>
              <marker id="flow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" className="flow-arrowhead" />
              </marker>
            </defs>

            <g className="flow-device">
              <rect x="46" y="58" width="22" height="40" rx="3" />
              <circle cx="57" cy="90" r="1.5" className="flow-device-dot" />
              <rect x="36" y="112" width="42" height="30" rx="3" />
              <rect x="28" y="156" width="58" height="36" rx="2" />
              <path d="M49 192 v8 M41 200 h24" />
            </g>
            <text className="flow-caption" x="57" y="224" textAnchor="middle">Client</text>

            <BlockArrow x={96} y={78} width={62} height={28} direction="right" />
            <text className="flow-arrow-label" x={127} y={70} textAnchor="middle">Request</text>
            <BlockArrow x={96} y={128} width={62} height={28} direction="left" />
            <text className="flow-arrow-label" x={127} y={172} textAnchor="middle">Response</text>

            <rect x="176" y="16" width="470" height="248" rx="10" className="flow-dashed" />
            <text className="flow-caption" x="411" y="284" textAnchor="middle">Render</text>

            <ellipse cx="286" cy="58" rx="78" ry="20" className="flow-oval" />
            <text className="flow-label" x="286" y="63" textAnchor="middle">Home</text>
            <ellipse cx="286" cy="112" rx="78" ry="20" className="flow-oval" />
            <text className="flow-label" x="286" y="117" textAnchor="middle">Users</text>
            <ellipse cx="286" cy="166" rx="78" ry="20" className="flow-oval" />
            <text className="flow-label" x="286" y="171" textAnchor="middle">Contact</text>
            <text className="flow-caption" x="286" y="214" textAnchor="middle">Front end</text>

            <line x1="364" y1="90" x2="400" y2="72" className="flow-line" markerEnd="url(#flow-head)" />
            <line x1="400" y1="150" x2="364" y2="166" className="flow-line" markerEnd="url(#flow-head)" />

            <rect x="400" y="36" width="210" height="156" className="flow-panel" />
            <path d="M424 52 H590 L574 96 H408 Z" className="flow-slant" />
            <path d="M416 74 H582 L574 96 H408 Z" className="flow-slant-face" />
            <text className="flow-label" x="499" y="80" textAnchor="middle">DTO check</text>
            <path d="M468 112 h22 l10 -12 h28 v64 h-60 Z" className="flow-doc" />
            <path d="M490 100 v12 h10" className="flow-doc-fold" />
            <text className="flow-label" x="498" y="148" textAnchor="middle">JWT</text>
            <text className="flow-caption" x="505" y="214" textAnchor="middle">Back end</text>

            <path d="M748 36 A55 14 0 0 0 858 36 L858 112 A55 14 0 0 1 748 112 Z" className="flow-cylinder" />
            <ellipse cx="803" cy="36" rx="55" ry="14" className="flow-cylinder-top" />
            <text className="flow-cylinder-label" x="803" y="84" textAnchor="middle">Neon</text>
            <text className="flow-caption" x="803" y="148" textAnchor="middle">Postgres</text>

            <g transform="translate(746 162)">
              <path d="M22 34C6 34 4 20 18 18C16 6 36 2 48 12C58 4 82 8 80 20C98 22 100 36 84 38C82 50 54 52 42 44C26 52 8 44 22 34Z" className="flow-cloud" />
              <text className="flow-label" x="52" y="34" textAnchor="middle">Resend</text>
            </g>
            <g transform="translate(746 214)">
              <path d="M22 34C6 34 4 20 18 18C16 6 36 2 48 12C58 4 82 8 80 20C98 22 100 36 84 38C82 50 54 52 42 44C26 52 8 44 22 34Z" className="flow-cloud" />
              <text className="flow-label" x="52" y="34" textAnchor="middle">Observe</text>
            </g>

            <line x1="610" y1="52" x2="744" y2="52" className="flow-line" markerEnd="url(#flow-head)" />
            <text className="flow-arrow-label" x="676" y="46" textAnchor="middle">Pooled</text>
            <line x1="744" y1="96" x2="610" y2="96" className="flow-line" markerEnd="url(#flow-head)" />
            <text className="flow-arrow-label" x="676" y="112" textAnchor="middle">Direct</text>
            <line x1="610" y1="186" x2="742" y2="186" className="flow-line" markerEnd="url(#flow-head)" />
            <text className="flow-arrow-label" x="674" y="178" textAnchor="middle">Mail</text>
            <line x1="610" y1="238" x2="742" y2="238" className="flow-line" markerEnd="url(#flow-head)" />
            <text className="flow-arrow-label" x="674" y="230" textAnchor="middle">Traces</text>
          </svg>
          <p className="flow-note text-secondary">
            The browser keeps a 15-minute bearer token. A 401 renews it from the 7-day refresh cookie. Render builds the API from GitHub and does not build the client repo. Queries use Neon’s pooled URL. Migrate uses the direct URL, and a push does not migrate on its own.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
