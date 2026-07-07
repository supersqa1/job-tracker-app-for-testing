---
name: Aura Executive
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#080f10'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#fff6e7'
  on-tertiary: '#3c2f00'
  tertiary-container: '#ffd753'
  on-tertiary-container: '#745d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style
The design system embodies "Minimalist Futurism," a philosophy centered on high-density information clarity paired with high-fidelity visual aesthetics. It is designed for high-performance job seeking and career management in 2026. The emotional response is one of surgical precision, calm authority, and technological edge.

The aesthetic utilizes **Glassmorphism 2.0**, which avoids the heavy, blurry "blob" styles of the past in favor of ultra-sharp, micro-thin borders, subtle backdrop-filter blurs, and layered translucency. This creates a sense of depth and hierarchy without physical mass. The UI should feel like a specialized head-up display (HUD)—lightweight, responsive, and obsessively organized.

## Colors
The palette is rooted in a "Deep Space" dark mode, utilizing charcoal and slate tones to reduce eye fatigue while providing a high-contrast foundation for vibrant functional accents.

- **Primary (Laser Cyan):** Used for primary actions, progress indicators, and active states. It represents the "laser-focused" nature of the application.
- **Secondary (Electric Emerald):** Reserved for "Applied" or "Hired" statuses, success states, and positive growth metrics.
- **Surface Neutrals:** A range of slates (from #0F172A to #334155) provides the backdrop for glass layers.
- **Functional Accents:** Tertiary gold for "Pending" or "Interviewing" states and Danger red for "Rejected" or "Withdrawn" statuses.

Strictly avoid the use of purple, violet, or pink gradients to maintain the professional, utilitarian-futurist identity.

## Typography
The typography system prioritizes technical legibility. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, utilizing generous letter spacing to evoke a premium, editorial feel. 

**Inter** handles the heavy lifting for body text, ensuring readability across dense job descriptions and status updates. **Geist** is used for labels and metadata, providing a monospaced, technical rhythm that complements the "Glassmorphism 2.0" aesthetic. All headers should favor a slightly tracked-out letter spacing (approx 2-5%) to enhance the futuristic "HUD" atmosphere.

## Layout & Spacing
The layout follows a 12-column fluid grid system with a fixed maximum container width for desktop readability. 

- **The Rhythm:** Based on a 4px base unit to ensure alignment of thin-line borders and geometric shapes.
- **Glass Panes:** Content is organized into "Panes" rather than standard cards. Panes use `1px` inner padding for their "precision borders" and `24px` internal padding for content.
- **Density:** The system supports "Comfortable" and "Compact" modes. Compact mode reduces gutters to 12px and internal padding to 16px for data-heavy job tracking views.
- **Reflow:** On mobile, the 12-column grid collapses to 4 columns. All "Glass Panes" become full-width with a reduced backdrop blur to save mobile GPU cycles.

## Elevation & Depth
Depth is not communicated through traditional drop shadows, but through **Optical Layering**:

1.  **Level 0 (Base):** Deep Charcoal (#0F172A), solid background.
2.  **Level 1 (Panes):** Semi-transparent Slate (#1E293B at 60% opacity) with `backdrop-filter: blur(12px)`.
3.  **Level 2 (Floating/Modals):** Lighter Translucent Slate (#334155 at 80% opacity) with `backdrop-filter: blur(24px)`.

**Precision Borders:** Every elevated element must have a 1px solid border. Use a top-down gradient for the border: `rgba(255, 255, 255, 0.15)` at the top fading to `rgba(255, 255, 255, 0.05)` at the bottom. This simulates a "rim light" effect from a virtual top-down light source.

## Shapes
The shape language is "Soft-Technical." Elements use a consistent `0.25rem` (4px) corner radius to maintain a crisp, professional look. Avoid fully circular buttons unless they are icon-only floating action buttons.

- **Primary Surfaces:** 4px radius (`rounded`).
- **Interactive Elements:** 4px radius (`rounded`).
- **Status Tags/Chips:** 2px radius or 0px to emphasize the "precision" aesthetic.
- **Active State Indicators:** Vertical 2px wide bars to the left of active list items.

## Components

- **Neo-Glass Buttons:** Buttons feature a solid 1px border. The primary button uses a subtle `0 0 15px rgba(0, 242, 255, 0.3)` outer glow. On hover, the glow intensity increases.
- **Translucent Chips:** Status tags are semi-transparent with a 1px border colored according to the status (e.g., Laser Cyan for "Active"). Text inside is all-caps Geist Mono.
- **Input Fields:** Dark, recessed backgrounds with a `1px` bottom-only border that glows Laser Cyan upon focus. Use placeholder text in a low-contrast Slate Gray.
- **Job Cards (Panes):** Feature a 1px rim-light border. The company logo should be placed in a small 40x40 glass square with a 10% white overlay.
- **Timeline/Process Tracker:** An ultra-thin `1px` vertical line connecting nodes. Completed nodes glow with Electric Emerald; the active node pulses with Laser Cyan.
- **Side Navigation:** A frosted glass blur (`blur(20px)`) that spans the full height, with active links indicated by a Laser Cyan "light bar" on the far left.