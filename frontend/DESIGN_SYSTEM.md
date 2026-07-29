# SuperSQA Job Tracker Design System

This is the frontend design reference for the course app. Keep it concise and implementation-focused.

## Visual Direction

- Style: dark, precise, high-contrast job-tracker interface.
- Primary accent: cyan.
- Secondary accent: emerald.
- Warning/progress accent: gold.
- Error/rejected accent: red.
- Avoid purple, violet, and pink gradients.

## Core Tokens

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0d1515` | Page base |
| `surface-container-low` | `#151d1e` | Sidebar and recessed panels |
| `surface-container` | `#192122` | Card inner fill |
| `surface-container-high` | `#232b2c` | Hover/elevated states |
| `on-surface` | `#dce4e4` | Primary text |
| `on-surface-variant` | `#b9cacb` | Secondary text |
| `outline` | `#849495` | Borders and placeholders |
| `outline-variant` | `#3a494b` | Subtle dividers |
| `primary-fixed-dim` | `#00dbe7` | Primary action/accent |
| `secondary` | `#4edea3` | Success/positive states |
| `tertiary-fixed-dim` | `#eec200` | Pending/interview states |
| `error` | `#ffb4ab` | Error/rejected states |

## Application Status Mapping

| Status | Accent |
|---|---|
| Potential | `outline` |
| Applied | `primary-fixed-dim` |
| In Progress | `secondary` |
| Final Stage | `tertiary-fixed-dim` |
| Hired | `secondary` |
| Rejected | `error` |
| Withdrawn | `error` |

## UI Rules

- Use semantic tokens from `frontend/src/app/globals.css` instead of raw hex values.
- Use `.glass-pane` and `.precision-border` for elevated cards and panels.
- Labels and metadata should be uppercase with wider letter spacing.
- Inputs use dark recessed backgrounds and cyan focus states.
- Keep border radii small: most panes/buttons use `4px`; larger panels use `8px`.
- Use short transitions, generally `200ms` to `300ms`.
