# GoboClean Rapport - Color Scheme Reference

## Brand Colors

### Primary - Lime Green
The primary color for all main actions and CTAs.

| Usage | Tailwind Class | Hex Code | HSL |
|-------|---------------|----------|-----|
| Background | `bg-lime-500` | `#84cc16` | `hsl(84, 81%, 56%)` |
| Background Hover | `bg-lime-600` | `#65a30d` | `hsl(84, 85%, 35%)` |
| Text | `text-lime-400` | `#a3e635` | `hsl(84, 81%, 56%)` |
| Text Bright | `text-lime-300` | `#bef264` | `hsl(84, 100%, 65%)` |
| Border | `border-lime-500` | `#84cc16` | - |
| Shadow | `shadow-lime-500/30` | - | - |

**Usage Examples:**
```tsx
// Primary Button
className="bg-gradient-to-r from-lime-500 to-lime-600"

// Text Accent
className="text-lime-400"

// Hover State
className="hover:text-lime-300"
```

---

### Secondary - Emerald/Teal
Used for headers, navigation, and secondary elements.

| Usage | Tailwind Class | Hex Code | HSL |
|-------|---------------|----------|-----|
| Background Dark | `bg-emerald-800` | `#065f46` | `hsl(160, 84%, 39%)` |
| Background Darker | `bg-emerald-900` | `#064e3b` | `hsl(160, 84%, 32%)` |
| Background Teal | `bg-teal-900` | `#134e4a` | `hsl(178, 60%, 19%)` |
| Text | `text-emerald-700` | `#047857` | `hsl(160, 84%, 39%)` |
| Border | `border-emerald-700` | `#047857` | - |

**Usage Examples:**
```tsx
// Header Background
className="bg-gradient-to-br from-emerald-800 to-teal-900"

// Icon Container
className="bg-emerald-900/40 border-emerald-700/50"
```

---

### Neutral - Slate
Used for text, backgrounds, and UI elements.

| Usage | Tailwind Class | Hex Code | HSL |
|-------|---------------|----------|-----|
| Background Darkest | `bg-slate-900` | `#0f172a` | `hsl(222, 84%, 5%)` |
| Background Dark | `bg-slate-800` | `#1e293b` | `hsl(217, 33%, 17%)` |
| Background Medium | `bg-slate-700` | `#334155` | `hsl(215, 25%, 27%)` |
| Text Dark | `text-slate-700` | `#334155` | - |
| Text Medium | `text-slate-600` | `#475569` | - |
| Text Light | `text-slate-500` | `#64748b` | - |
| Text Lighter | `text-slate-400` | `#94a3b8` | - |
| Border | `border-slate-300` | `#cbd5e1` | - |

**Usage Examples:**
```tsx
// Page Background
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"

// Text
className="text-slate-700"

// Label
className="text-slate-700 font-medium"
```

---

### Accent - White/Light
Used for form backgrounds and light elements.

| Usage | Tailwind Class | Hex Code |
|-------|---------------|----------|
| Background | `bg-white` | `#ffffff` |
| Background Transparent | `bg-white/10` | - |
| Text | `text-white` | `#ffffff` |

**Usage Examples:**
```tsx
// Form Container
className="bg-white rounded-b-3xl"

// Overlay
className="bg-white/10 backdrop-blur-sm"
```

---

### Destructive - Red
Used for errors and destructive actions.

| Usage | Tailwind Class | Hex Code |
|-------|---------------|----------|
| Background | `bg-red-500` | `#ef4444` |
| Text | `text-red-500` | `#ef4444` |
| Border | `border-red-500` | `#ef4444` |

**Usage Examples:**
```tsx
// Error Border
className="border-red-500"

// Error Text
className="text-red-500"
```

---

## Gradient Combinations

### Header Gradient
```tsx
className="bg-gradient-to-br from-emerald-800 to-teal-900"
```

### Button Gradient
```tsx
className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700"
```

### Background Gradient
```tsx
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
```

---

## Shadow Effects

### Button Shadow
```tsx
className="shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40"
```

### Card Shadow
```tsx
className="shadow-2xl"
```

---

## Opacity Variations

| Opacity | Suffix | Example |
|---------|--------|---------|
| 10% | `/10` | `bg-white/10` |
| 20% | `/20` | `border-white/20` |
| 30% | `/30` | `bg-emerald-900/30` |
| 40% | `/40` | `bg-emerald-900/40` |
| 50% | `/50` | `border-emerald-700/50` |
| 60% | `/60` | `text-muted-foreground/60` |

---

## CSS Custom Properties

These are defined in `src/assets/styles/globals.css`:

```css
:root {
  /* Primary: Lime Green */
  --primary: 84 81% 56%;
  --primary-foreground: 222.2 47.4% 11.2%;
  
  /* Secondary: Emerald/Teal */
  --secondary: 160 84% 39%;
  --secondary-foreground: 210 40% 98%;
  
  /* Accent: Bright Lime */
  --accent: 84 100% 65%;
  --accent-foreground: 222.2 47.4% 11.2%;
}
```

**Usage:**
```tsx
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-accent text-accent-foreground"
```

---

## Color Accessibility

All color combinations meet WCAG 2.1 Level AA standards:

| Foreground | Background | Contrast Ratio | Pass |
|------------|-----------|----------------|------|
| Slate-900 | Lime-500 | 8.2:1 | ✅ AAA |
| White | Emerald-800 | 7.5:1 | ✅ AAA |
| Slate-700 | White | 10.4:1 | ✅ AAA |
| Lime-400 | Emerald-800 | 4.8:1 | ✅ AA |

---

## Quick Reference

### Common Patterns

**Primary Button:**
```tsx
<Button className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-slate-900 shadow-lg shadow-lime-500/30">
  Action
</Button>
```

**Input Field:**
```tsx
<Input className="h-12 rounded-lg bg-muted/30 border-input focus:border-primary/40" />
```

**Label:**
```tsx
<Label className="text-xs font-bold uppercase tracking-wide text-slate-700">
  Field Name
</Label>
```

**Header:**
```tsx
<div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-t-3xl px-8 py-12">
  <Logo />
</div>
```

**Page Background:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  {/* Content */}
</div>
```

---

## Color Psychology

- **Lime Green**: Energy, growth, freshness, action
- **Emerald/Teal**: Trust, professionalism, stability
- **Slate**: Modern, clean, professional
- **White**: Clarity, simplicity, cleanliness

---

## Browser Support

All colors and gradients are supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

**Last Updated**: February 3, 2026
