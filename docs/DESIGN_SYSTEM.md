# SuperSQA Job Tracker Design System

> Derived from the **Aura Executive** theme exported via Google Stitch (`design/stitch_nexus_career_flow/`). Use this document as the single source of truth for UI decisions in the frontend.

## Brand Identity

**Philosophy:** Minimalist Futurism — high-density information clarity with high-fidelity aesthetics. The UI should feel like a specialized head-up display (HUD): lightweight, responsive, and obsessively organized.

**Emotional tone:** Surgical precision, calm authority, technological edge.

**Avoid:** Purple, violet, or pink gradients. They break the professional, utilitarian-futurist identity.

---

## Color Tokens

All tokens use semantic names. Prefer tokens over raw hex in components.

### Surfaces (Deep Space dark mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0d1515` | Page base (Level 0) |
| `surface` | `#0d1515` | Same as background |
| `surface-dim` | `#0d1515` | Dimmed surface |
| `surface-bright` | `#333b3b` | Elevated contrast surface |
| `surface-container-lowest` | `#080f10` | Deepest inset |
| `surface-container-low` | `#151d1e` | Sidebar, recessed panels |
| `surface-container` | `#192122` | Card inner fill |
| `surface-container-high` | `#232b2c` | Hover states |
| `surface-container-highest` | `#2e3637` | Strongest container |
| `surface-variant` | `#2e3637` | Alternate surface |

### Content

| Token | Hex | Usage |
|-------|-----|-------|
| `on-background` | `#dce4e4` | Primary text |
| `on-surface` | `#dce4e4` | Text on surfaces |
| `on-surface-variant` | `#b9cacb` | Secondary text |
| `outline` | `#849495` | Borders, placeholders |
| `outline-variant` | `#3a494b` | Subtle dividers |

### Primary — Laser Cyan

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#e1fdff` | Primary text on dark fills |
| `primary-fixed-dim` | `#00dbe7` | **Primary accent** — actions, active states, progress |
| `primary-fixed` | `#74f5ff` | Bright highlight |
| `primary-container` | `#00f2ff` | Filled primary surfaces |
| `on-primary-container` | `#006a71` | Text on primary container |
| `surface-tint` | `#00dbe7` | Tint overlays |

### Secondary — Electric Emerald

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#4edea3` | Success, Applied, Hired, positive metrics |
| `secondary-fixed` | `#6ffbbe` | Bright success highlight |
| `secondary-container` | `#00a572` | Success container fill |

### Tertiary — Gold

| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary-fixed-dim` | `#eec200` | Pending, Interviewing, Final Stage |
| `tertiary-fixed` | `#ffe083` | Bright gold highlight |
| `tertiary-container` | `#ffd753` | Gold container fill |

### Error — Danger Red

| Token | Hex | Usage |
|-------|-----|-------|
| `error` | `#ffb4ab` | Rejected, Withdrawn status text |
| `error-container` | `#93000a` | Error background |

---

## Application Status Colors

Map pipeline statuses to accent colors consistently:

| Status | Accent token | Column border |
|--------|--------------|---------------|
| Potential | `outline` | `outline-variant/30` |
| Applied | `primary-fixed-dim` | `primary-fixed-dim/30` |
| In Progress | `secondary` | `secondary/30` |
| Final Stage | `tertiary-fixed-dim` | `tertiary-fixed-dim/30` |
| Hired | `secondary` | `secondary/30` |
| Rejected | `error` | `error/30` |
| Withdrawn | `error` | `error/30` |

---

## Typography

| Role | Font | Size | Weight | Line height | Letter spacing |
|------|------|------|--------|-------------|----------------|
| Display | Hanken Grotesk | 48px | 700 | 1.1 | 0.05em |
| Headline LG | Hanken Grotesk | 32px | 600 | 1.2 | 0.02em |
| Headline LG (mobile) | Hanken Grotesk | 24px | 600 | 1.2 | — |
| Headline MD | Hanken Grotesk | 20px | 600 | 1.4 | — |
| Body LG | Inter | 18px | 400 | 1.6 | — |
| Body MD | Inter | 16px | 400 | 1.6 | — |
| Label SM | Geist | 12px | 500 | 1 | 0.1em (uppercase) |
| Mono Data | Geist Mono | 14px | 400 | 1.4 | — |

**Rules:**
- Headlines use tracked letter-spacing (2–5%) for the HUD atmosphere.
- Labels and metadata are uppercase with wide tracking.
- Body copy uses Inter for dense content readability.

---

## Spacing & Layout

- **Base unit:** 4px — align borders and geometry to this grid.
- **Gutter:** 24px — standard horizontal padding.
- **Margin mobile:** 16px
- **Margin desktop:** 48px
- **Container max width:** 1440px
- **Grid:** 12 columns on desktop, 4 columns on mobile.

### Density modes

| Mode | Gutter | Pane padding |
|------|--------|--------------|
| Comfortable (default) | 24px | 24px |
| Compact | 12px | 16px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 2px (0.125rem) | Status chips |
| DEFAULT | 4px (0.25rem) | Panes, buttons, inputs |
| `lg` | 4px (0.25rem) | Same as default |
| `xl` | 8px (0.5rem) | Larger panes |
| `full` | 12px (0.75rem) | Avatars, FAB only |

Avoid fully circular buttons except icon-only FABs.

---

## Elevation & Glass Layers

Depth is communicated through **optical layering**, not drop shadows.

| Level | Background | Blur | Usage |
|-------|------------|------|-------|
| 0 — Base | `#0d1515` solid | none | Page background |
| 1 — Pane | `rgba(30, 41, 59, 0.6)` | 12px | Cards, kanban columns |
| 2 — Floating | `rgba(51, 65, 85, 0.8)` | 24px | Modals, popovers |

### Precision border (rim light)

Every elevated element gets a 1px border simulating top-down rim lighting:

```css
border: 1px solid transparent;
background: linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05)) border-box;
```

Use the `.glass-pane` and `.precision-border` utility classes defined in `frontend/src/app/globals.css`.

---

## Components

### Neo-Glass Button (primary)

- 1px border with cyan glow: `box-shadow: 0 0 15px rgba(0, 242, 255, 0.3)`
- Hover: glow intensifies to `0 0 25px rgba(0, 242, 255, 0.5)` + `rgba(0, 242, 255, 0.1)` fill
- Label: uppercase Geist, wide tracking

### Translucent status chips

- Semi-transparent background + 1px border colored to status accent
- Text: uppercase, Geist Mono, 10–12px

### Input fields

- Dark recessed background
- Bottom-only 1px border; glows Laser Cyan on focus
- Placeholder: low-contrast `outline` at 50% opacity

### Job cards (panes)

- Level 1 glass + precision border
- Company initials in 40×40 glass square with 10% white overlay
- Optional left accent bar (2px) for active/highlighted cards
- Hover: subtle `-translate-y-1` lift

### Side navigation

- Frosted glass: `backdrop-blur-2xl`, `surface-container-low/80`
- Collapsed: 80px wide; expands to 256px on hover
- Active link: 4px Laser Cyan left bar + `primary-container/10` background

### Timeline / process tracker

- 1px vertical connector line between nodes
- Completed nodes: Electric Emerald glow
- Active node: Laser Cyan pulse animation
- Pending nodes: `outline-variant`, 50% opacity

### Top navigation

- Sticky, `surface/60` + `backdrop-blur-xl`
- Bottom border: `outline-variant/30`
- Subtle cyan shadow: `0 0 15px rgba(0, 242, 255, 0.1)`

---

## Icons

Use **Material Symbols Outlined** from Google Fonts. Default weight 400; use `FILL 1` for active nav items.

Common icons: `dashboard`, `work`, `analytics`, `event_upcoming`, `settings`, `add`, `search`, `notifications`.

---

## Motion

- Transitions: 200–300ms ease
- Sidebar expand: 300ms ease-in-out
- Card hover lift: 300ms
- Active timeline node: CSS `animate-pulse` on inner dot

---

## Reference Screens

Stitch exports in `design/stitch_nexus_career_flow/`:

| Screen | File | Purpose |
|--------|------|---------|
| Dashboard | `neo_hire_dashboard/` | Kanban pipeline board |
| Application detail | `application_insights/` | Job detail + timeline |
| Analytics | `performance_metrics/` | Metrics dashboard |
| Strategic prep | `strategic_prep/` | Interview prep |

When in doubt, match the closest reference screen before inventing new patterns.
