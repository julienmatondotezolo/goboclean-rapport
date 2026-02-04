# Brand Color Migration Status

## ✅ Completed Files

### UI Components
- [x] `src/components/ui/button.tsx` - All variants updated
- [x] `src/components/ui/input.tsx` - Focus states updated
- [x] `src/components/ui/progress.tsx` - Progress bar updated
- [x] `src/components/ui/logo.tsx` - Logo colors updated
- [x] `src/components/ui/page-header.tsx` - Title color updated
- [x] `src/components/ui/floating-action-button.tsx` - Button colors updated
- [x] `src/components/ui/bottom-nav.tsx` - Active state colors updated

### Pages
- [x] `src/app/[locale]/(pages)/page.tsx` - Loading screen updated
- [x] `src/app/[locale]/layout.tsx` - Theme color annotated
- [x] `src/app/[locale]/(pages)/login/page.tsx` - Link decorations updated
- [x] `src/app/[locale]/(pages)/reports/page.tsx` - Search input and headers updated

## ⏳ Remaining Files (Manual Review Recommended)

### Large Page Files
- [ ] `src/app/[locale]/(pages)/schedule/page.tsx` - ~15 color instances
- [ ] `src/app/[locale]/(pages)/mission/new/page.tsx` - ~20 color instances
- [ ] `src/app/[locale]/(pages)/mission/[id]/page.tsx` - ~10 color instances
- [ ] `src/app/[locale]/(pages)/mission/[id]/before-pictures/page.tsx` - ~15 color instances
- [ ] `src/app/[locale]/(pages)/mission/[id]/after-pictures/page.tsx` - ~20 color instances

## Color Mapping Reference

Use these Tailwind class names instead of hex codes:

| Hex Code | Tailwind Class | Usage |
|----------|----------------|-------|
| `#a3e635` | `brand-green-light` | Primary buttons, highlights |
| `#84cc16` | `brand-green` | Standard green, focus states |
| `#65a30d` | `brand-green-dark` | Darker green variant |
| `#bdf05d` | `brand-green-lighter` | Hover states |
| `#93d635` | Use `rgb(147 214 53)` in shadows | Shadow color |
| `#064e3b` | `brand-emerald` | Dark emerald, containers |
| `#065f46` | `brand-emerald-light` | Lighter emerald |
| `#1e4620` | `brand-emerald-dark` | Text color |
| `#1a2e1a` | `brand-emerald-darker` | Very dark text |
| `#98d62e` | `brand-lime` | Accent lime |
| `#b4e655` | `brand-lime-soft` | Soft lime |
| `#c5f075` | `brand-lime-softer` | Softer lime |

## Replacement Pattern Examples

### Before:
```tsx
className="bg-[#a3e635] text-[#064e3b]"
```

### After:
```tsx
className="bg-brand-green-light text-brand-emerald"
```

### Before (with opacity):
```tsx
className="bg-[#84cc16]/10"
```

### After:
```tsx
className="bg-brand-green/10"
```

### Before (hover state):
```tsx
hover:bg-[#bdf05d]
```

### After:
```tsx
hover:bg-brand-green-lighter
```

## Next Steps

1. Review and update the remaining page files listed above
2. Test the application to ensure all colors display correctly
3. Run the dev server and check for any CSS compilation errors
4. Delete this file once migration is complete
