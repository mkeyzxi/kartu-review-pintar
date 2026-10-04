# Overview
Kartu Review Pintar Design System is a high-energy, brutalist-inspired UI framework designed for maximum visual impact and immediate user engagement. Built around **Archivo Black** — a heavy, condensed display font — and anchored to a clean white (#ffffff) surface, this design system uses sharp, solid borders and harsh drop shadows combined with the vibrant, iconic four-color Google palette (Blue, Red, Yellow, Green).

This system is built to command attention. It feels like a mix of modern tech utility and playful, bold retro-brutalism. It is perfect for tools, marketing sites, and applications where confidence, speed, and energy are the primary messages.

# Design Tokens
## Color Palette
The color system relies on a stark black-and-white foundation, punctuated by vibrant primary colors inspired by Google. These colors pop intensely against the white background.

| Token | Value | Purpose |
| --- | --- | --- |
| **Google Blue** | `#4285F4` | Primary actions (buttons), key interactive elements, and main highlights |
| **Google Red** | `#EA4335` | Destructive actions, urgent alerts (e.g., Suspended status), and energetic accents |
| **Google Yellow** | `#FBBC05` | Attention grabbers, warning states (e.g., Expired status), and secondary highlights |
| **Google Green** | `#34A853` | Positive feedback, success states, and active indicators |
| **Surface** | `#ffffff` | The primary background color. Clean, bright, and spacious. |
| **Text/Border** | `#111827` | Near-black used for all text, thick component borders, and solid brutalist shadows. |
| **Gray** | `#f8f9fa` | Subtle backgrounds for footers or secondary sections. |

**The Light Surface Strategy:** Unlike dark-mode systems, this design relies on a blazing white canvas. The stark `#111827` (near-black) borders provide aggressive framing for every element, ensuring that the colorful Google accents jump off the screen.

## Typography
The system uses a combination of heavy display fonts and highly readable sans-serifs.

- **Primary and Display Font: Archivo Black.** A heavy, bold sans-serif. Used for all headings (H1-H6), buttons, and key labels. It is always used in UPPERCASE for maximum brutalist impact.
- **Body Font: Inter.** A clean, highly legible sans-serif used for body text, paragraphs, and secondary data.
- **Monospace Font: JetBrains Mono.** Used for codes, PINs, or technical data representation.

## Components & Brutalist Styling
The defining characteristic of this design system is its approach to borders and shadows.

- **Solid Borders:** All cards, buttons, inputs, and major layout sections feature a thick, solid border (typically `border-2` or `border-4` using `#111827`).
- **Hard Shadows (Brutalist Shadows):** Instead of soft, blurred drop-shadows, this system uses solid, offset shadows (e.g., `shadow-[8px_8px_0px_#111827]`). When a user hovers over an interactive element, the shadow often expands (e.g., to `12px_12px`) while the element translates up and left, creating a tactile, physical "button-press" feel.
- **Rounded Corners:** Despite the aggressive shadows and borders, elements maintain friendly, rounded corners (e.g., `rounded-xl` or `rounded-2xl`) to keep the design approachable.

### Button Example
```css
.btn-google-blue {
    background: #4285F4;
    color: white;
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    border-radius: 0.75rem;
    border: 3px solid #111827;
    box-shadow: 4px 4px 0px #111827;
    transition: all 0.2s ease;
}
.btn-google-blue:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111827;
}
```

## Layout and Spacing
- **Airy and Spacious:** The heavy borders and bold typography require generous whitespace. Sections use padding like `py-20` or `py-24` to let the dense UI elements breathe.
- **Responsive Grids:** The system utilizes Tailwind's flexible grid and flexbox utilities to ensure that the bold layout scales down perfectly to mobile devices without overlapping the thick borders.

## Animations
Animations are used strategically to add life to the stark layout.
- **Fade-Up:** Used for staggered entrance animations on page load (`animate-fade-up`).
- **Floating:** Used on hero illustrations or decorative elements to create a sense of depth and playfulness (`animate-float`).
- **Pulse:** Used on small indicator dots (like the red dot in the hero section badge) to draw the eye immediately.

# Accessibility & Usability
- **High Contrast:** The combination of `#111827` text on `#ffffff` backgrounds ensures maximum WCAG contrast compliance.
- **Clear Affordance:** The thick borders and shifting hard shadows make it immediately obvious what elements are interactive.
- **Large Touch Targets:** Buttons and inputs are designed large and chunky, making them incredibly easy to tap on mobile devices.

# Design Philosophy
1. **Loud and Clear:** This isn't a subtle design. It’s meant to be loud. The Archivo Black typography combined with the stark borders demands the user's attention.
2. **Tactile Interaction:** The brutalist shadow technique makes the digital interface feel like physical, punchable buttons and cards.
3. **Brand Trust via Color:** Utilizing the recognizable red, yellow, green, and blue injects a subconscious feeling of familiarity and reliability (reminiscent of major tech ecosystems) into a bold, independent framework.
