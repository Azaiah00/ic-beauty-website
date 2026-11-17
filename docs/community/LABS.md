# Labs: interactive learning in The H.A.I.R. Circle Community

Labs are short, hands-on pieces at `/community/labs`. Three ship today, built natively in React and SVG.
Six more slots are reserved for richer pieces built later in a separate session.

## Where things live

| What | File |
| --- | --- |
| The list of Labs (title, promise, minutes, cover, who can open it) | `src/lib/community/labs.ts` |
| The lazy loader (one chunk per Lab, never in the main bundle) | `src/components/community/labs/LabHost.tsx` |
| The contract type | `src/components/community/labs/types.ts` |
| The Labs themselves | `src/components/community/labs/*.tsx` |
| Pages | `src/app/(community)/community/labs/page.tsx` and `labs/[id]/page.tsx` |
| Completion + points | action `lab.complete` in `src/lib/server/community/actions.ts` |

## The Lab contract

A Lab is a client component with a **default export** and exactly these props:

```ts
type LabProps = {
  actor: { id: string; name: string };
  onComplete: (score: number) => void; // 0 to 100, call it once when the member finishes
};
```

- `LabHost` supplies `onComplete`. It calls `lab.complete`, which saves the score to the member's progress and
  awards **+2 points** the first time (the team can switch Lab points off in Community → Settings).
- A Lab never talks to storage or the API itself, and never makes an external network request.
  A source link the member can tap (`<a target="_blank" rel="noopener noreferrer">`) is fine.
- A Lab does not render its own education-only footer; the page adds `<EducationNote>` under every Lab.

## Adding a Lab

1. Add (or edit) its entry in `src/lib/community/labs.ts`:
   `id`, `title`, `promise`, `minutes`, `cover` (an image key in `/public/images`), and optionally
   `minPlan` (`"circle"` or `"inner"`) or `levelUnlock` (free members can open it at that level).
2. Create `src/components/community/labs/<Name>.tsx` following the contract above.
3. Add one line to `COMPONENTS` in `LabHost.tsx`:
   `"<id>": dynamic(() => import("./<Name>"), { ssr: false, loading }),`
4. For a reserved slot, remove `teamOnly: true` from its registry entry. Until then only the team sees the
   card, marked "Coming soon", and members get a 404 on its address.
5. Run `npx tsc --noEmit && npm run build`, then walk the review checklist below.

Lock logic is the same as courses: the page and the `lab.complete` action both ask
`can(actor, "lab.view", labGate(lab))` from `src/lib/community/permissions.ts`. Locked cards stay visible
with a friendly reason and a link to the plans page.

## Size budget

**150 KB gzipped or less per Lab**, including anything it imports. Heavy libraries (Three.js for the Follicle
Explorer, for example) must be imported inside the Lab file so they stay in that Lab's lazy chunk.
Never import `gsap` statically (house rule in `CLAUDE.md`).

## Review checklist (every Lab, before it is switched on)

**Accuracy**
- [ ] Every fact has a named source, and the source is linked where the fact is shown.
- [ ] Numbers match the source exactly (for example: "Shedding 50–100 hairs a day is normal", American
      Academy of Dermatology, https://www.aad.org/public/diseases/hair-loss/insider/shedding).
- [ ] Wording matches the curriculum lessons in `src/lib/portal/data.ts` where the same idea is taught.

**Compliance language (Virginia, non-physician)**
- [ ] Copy only says *assess / support / educate / refer*.
- [ ] Copy never says *diagnose / treat / cure* and never promises regrowth.
- [ ] The Lab teaches what to notice. It never tells a member what is wrong with their hair or scalp.
- [ ] The education-only note is visible on the page.

**Accessibility**
- [ ] Everything works with the keyboard alone (native inputs and buttons, visible focus).
- [ ] Every drawing or animation has a text alternative; changes are announced with `aria-live`.
- [ ] Feedback never relies on color alone (icon and words too). Contrast is AA.
- [ ] Touch targets are at least 44px. Works at 375px wide with no sideways scroll.

**Motion and performance**
- [ ] Respects `prefers-reduced-motion` (use `reducedMotion()` from `types.ts` for JS-driven motion).
- [ ] Brand tokens only (the `@theme` colors in `src/app/globals.css`). No emoji; lucide icons.
- [ ] No external network calls. At or under the 150 KB gzipped budget.
- [ ] Loaded through `LabHost` with `next/dynamic` and `ssr: false`.

## Shipping now

| Lab | Who can open it | What it is |
| --- | --- | --- |
| The Hair Growth Cycle (`growth-cycle`) | Every member | A timeline slider across anagen, catagen, telogen and exogen. An SVG follicle changes with the slider. Two fact chips with the AAD source link, then a 3-question check. |
| Shed or Broken? (`shed-or-broken`) | Every member | A sorting game: tap, swipe or use the arrow keys. Instant feedback with a short explanation, a running score, and Play again. |
| Build Your Wash Day (`build-your-wash-day`) | Circle and Inner Circle | Put the seven steps in order. Gentle hints from Lesson 3, then a printable personal routine card. |

## Reserved slots (team-only "Coming soon" cards)

These are the slots for the pieces to be built later and dropped into the registry:

1. **Follicle Explorer 3D** (`follicle-explorer`): rotate and zoom a scalp cross-section and tap structures to learn (Three.js, lazy loaded).
2. **Porosity Lab** (`porosity-lab`): a water drop on low, medium and high porosity strands, with sliders for cuticle lift and product weight.
3. **Tension Meter** (`tension-meter`): pick a style, tightness and weeks worn, and watch a hairline tension gauge with "give your edges a break" guidance.
4. **Grandma Said… Myth or Fact** (`myth-or-fact`): a swipe game built on the Episode 1 story and the content-menu myths (trims, greasing, braids).
5. **Ingredient Decoder** (`ingredient-decoder`): paste a label and get plain-language education about common ingredient families (education only, no medical claims).
6. **My H.A.I.R. Story** (`my-hair-story`): an interactive timeline where members map their hair history (Lesson 1, "Your Hair Story"), saved privately to My Journey.
