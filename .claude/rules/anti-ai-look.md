# Anti-AI-Look UI Guidelines

AI-generated UI có xu hướng: `rounded-4xl` everywhere, spacing đều đặn, colors perfect theory, shadows layered, transitions đồng bộ. Rules này ngăn chặn pattern đó.

## Stack

- Tailwind v4 + CSS variables + Base UI + shadcn base-nova
- CVA cho variants, oklch colors trong `tokens.css`
- Base radius: `--radius: 0.625rem` (~10px)

## 1. Border Radius

**Base-nova trap:** style "base-nova" dùng `rounded-lg` làm default → UI đều đặn.

| Rule | Override | Khi nào dùng |
|------|----------|--------------|
| Input | `rounded-md` hoặc `rounded-sm` | Thay vì default `rounded-lg` |
| Button | `rounded-lg` (default OK) | Button đã override trong `button.tsx` |
| Card | `rounded-lg` hoặc `rounded-md` | Giảm từ `rounded-xl` |
| Badge/Pill | `rounded-4xl` | Chỉ badge/pill mới |
| Avatar | `rounded-full` | OK |

```tsx
// ❌ Base-nova default: rounded-lg
<input className="h-9 rounded-lg px-3" />

// ✅ Override: rounded-md hoặc rounded-sm
<input className="h-8 rounded-md px-2.5 text-sm" />
```

## 2. Spacing

**Anti-pattern:** AI dùng `gap-4` everywhere, padding đều `p-4`.

| Rule | Implementation |
|------|----------------|
| Gap xen kẽ | `gap-3` / `gap-4` / `gap-5` thay vì all `gap-4` |
| Padding vary | `p-3` / `p-4` / `p-5` trong cùng section |
| Section margin break | `mb-4` → `mb-5` → `mb-6` break rhythm |

```tsx
// ❌ AI pattern: đều đặn
<div className="flex gap-4 p-4">

// ✅ Human pattern: xen kẽ
<div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-5 md:py-4">
```

## 3. Color — Imperfection

**Anti-pattern:** `oklch(0.97 0 0)` — values quá round, colors textbook theory.

| Rule | Implementation |
|------|----------------|
| oklch imperfection | Thêm slight variation: `oklch(0.972 0.005 250)` |
| Desaturated tones | Giảm saturation 5-10% cho success/danger |
| Warm/cool undertone | Backgrounds thêm very subtle undertone |

```css
/* Current — quá perfect */
--color-primary-soft: oklch(0.97 0 0);

/* Đề xuất — slight imperfection */
--color-primary-soft: oklch(0.972 0.008 252);
--color-primary-border: oklch(0.925 0.012 254);
```

## 4. Shadows

**Anti-pattern:** AI dùng `shadow-sm` + `shadow-md` + `shadow-lg` layered.

| Rule | Implementation |
|------|----------------|
| Không shadow cho mọi card | Admin cards: border-based, **KHÔNG** shadow |
| Chỉ 1 shadow level | Vary intensity bằng opacity |
| Shadow chỉ khi cần | Elevation chỉ khi cần explicit depth |

## 5. Typography

| Rule | Implementation |
|------|----------------|
| Headings | Thêm `tracking-tight` |
| Line-height vary | `leading-5` / `leading-6` thay vì always `leading-7` |
| Font weight | Không mọi text đều `font-medium` — vary with `font-normal`, `font-semibold` |

## 6. Motion

**Anti-pattern:** `transition-all duration-200` everywhere.

| Rule | Implementation |
|------|----------------|
| Duration vary | `duration-150` / `duration-200` / `duration-300` |
| Easing | `ease-out` cho exits, `ease-in-out` cho state changes |
| Micro-interactions | Thêm subtle unexpected hover effect (vd: slight scale) |

## 7. Layout — Break Symmetry

| Rule | Implementation |
|------|----------------|
| Không symmetric grid | Asymmetric layouts, varied margins |
| Header layout | `justify-between` nhưng với slight offset visual |
| Card internal | Header/body padding không equal |

## 8. Content — Copy

| Rule | Implementation |
|------|----------------|
| Conversational | Không formal quá: "Get started" thay vì "Initialize" |
| Error messages | Human-readable, không error codes |
| Placeholder | Real, contextual content thay vì "Enter text here" |

## Shadcn Base-nova Override Cheatsheet

| Component | Default (AI tendency) | Override |
|-----------|----------------------|----------|
| Input | `h-9 rounded-lg px-3` | `h-8 rounded-md px-2.5 text-sm` |
| Card | `rounded-xl shadow-lg` | `rounded-lg border` |
| Dialog | `rounded-2xl` | `rounded-xl` |
| Select | `h-9 rounded-lg` | `h-8 rounded-md` |

## Checklist

```
□ Radius: Override base-nova default → rounded-md/rounded-sm cho inputs
□ Spacing: Xen kẽ gap-3/gap-4/gap-5, không systematic
□ Colors: Thêm imperfection vào oklch values (slight warmth/hue)
□ Shadows: Chỉ khi cần, admin cards = border-based, không shadow
□ Typography: Vary line-height, add tracking-tight to headings
□ Motion: Vary duration 150-300ms, thêm micro-interactions
□ Layout: Break symmetry ở 1-2 places
□ Copy: Conversational language, không formal quá
```