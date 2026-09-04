# ZMW — Home Page

An animated, responsive home page for the ZMW clothing brand, built with
Create React App and plain CSS (no UI kit, no animation library).

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000. `npm run build` produces a production
bundle in `build/`.

## Folder structure

```
src/
├─ pages/
│  └─ Home.jsx              # composes every section, lazy-loads below-the-fold ones
├─ components/
│  ├─ Navbar/                # sticky header, shrinks + blurs on scroll
│  ├─ Hero/                  # staggered entrance sequence + parallax portrait
│  ├─ MarqueeStrip/           # partner/press strip with hover color reveal
│  ├─ Collections/            # asymmetric product grid, scroll-reveal cards
│  ├─ FeatureHighlights/      # service promises (support, returns, shipping)
│  ├─ StorySection/           # layered parallax imagery + process list
│  ├─ Stats/                  # count-up counters triggered on scroll
│  ├─ Testimonials/           # auto-advancing, pausable review carousel
│  ├─ Newsletter/             # validated email signup with inline feedback
│  ├─ Footer/
│  └─ ScrollReveal/           # reusable wrapper around useScrollReveal
├─ hooks/
│  ├─ useScrollReveal.js      # IntersectionObserver -> reveal-on-scroll
│  └─ useParallax.js          # rAF-driven scroll-linked offset
└─ styles/
   ├─ variables.css           # color/type/spacing/motion design tokens
   └─ global.css              # reset, base type, shared .btn / .reveal primitives
```

Each component owns its own `.jsx` + `.css` pair (colocated, not a global
stylesheet), so any section can be copied into another project on its own.

## How the animation system works

**Scroll reveal.** `useScrollReveal` attaches an `IntersectionObserver` to a
ref and flips a `visible` boolean the first time the element crosses the
viewport threshold. The `ScrollReveal` component wraps this so any section
can opt in with `<ScrollReveal>...</ScrollReveal>` or `delay={1..4}` for a
staggered group (see `Collections` and `FeatureHighlights`, which stagger
their grid items). The actual motion — an opacity/translate transition — is
a single shared CSS pair (`.reveal` / `.is-visible`) in `global.css`, so
there's one place to tune the easing or distance for the whole app.

**Parallax.** `useParallax(speed)` reads each element's position relative to
the viewport center inside one `requestAnimationFrame` loop per instance and
returns a pixel offset, applied as an inline `translateY`. Used sparingly —
just the hero portrait and the story section's background image — since
parallax on every image reads as noisy rather than intentional.

**The one choreographed moment.** The hero's headline, subcopy, CTAs and
stats step in with a short stagger on mount (`Hero.jsx` flips `is-ready`
after the first paint; `Hero.css` staggers each child's `animation-delay`).
This is the single non-user-triggered animation sequence on the page —
everything else below the fold reveals on scroll rather than on load, and
all card/button motion is a direct response to hover or focus.

**Reduced motion.** `prefers-reduced-motion: reduce` is respected in three
places: `global.css` collapses all transition/animation durations to near
zero, `useScrollReveal` reveals content immediately instead of observing,
and `useParallax` skips attaching its scroll listener entirely.

## Performance notes

- `FeatureHighlights`, `StorySection`, `Stats`, `Testimonials`, `Newsletter`
  and `Footer` are dynamically `import()`ed via `React.lazy` in `Home.jsx`,
  so the initial JS bundle only covers the hero and first product grid.
- Product and story images request appropriately sized crops from the
  source and use `loading="lazy"` except the hero's first image
  (`loading="eager"`) so the largest-contentful-paint element isn't delayed.
- Parallax and scroll-reveal both use a single `requestAnimationFrame` /
  `IntersectionObserver` per instance rather than unthrottled scroll
  listeners.

## Accessibility

- Semantic landmarks (`header`, `main`, `footer`, `nav`) and heading order
  throughout.
- Visible focus rings via `:focus-visible` (2px outline, brand rust) on
  every interactive element, including custom buttons.
- Carousel dots use `role="tab"` / `aria-selected`; the carousel pauses on
  hover and keyboard focus.
- Text/background pairings meet WCAG AA contrast (ink `#211D17` on linen
  `#F4EFE4`, and paper text on the ink stats/newsletter sections).
- All decorative SVGs are `aria-hidden`; icons that convey meaning (bag
  count, search) have `aria-label`s.
