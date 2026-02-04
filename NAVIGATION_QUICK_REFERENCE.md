# Navigation Components - Quick Reference

## 📍 Component Locations

| Component | Path | Type |
|-----------|------|------|
| `NavigationWrapper` | `src/components/navigation-wrapper.tsx` | Wrapper |
| `BottomNav` | `src/components/ui/bottom-nav.tsx` | UI Component |
| `FloatingActionButton` | `src/components/ui/floating-action-button.tsx` | UI Component |

## 🎯 Quick Usage

### Default Setup (Already Configured)
Navigation is automatically included in the pages layout. No additional setup needed!

```tsx
// src/app/[locale]/(pages)/layout.tsx
import { NavigationWrapper } from "@/components/navigation-wrapper";

export default function PagesLayout({ children }) {
  return (
    <>
      <NetworkIndicator />
      {children}
      <Toaster />
      <NavigationWrapper /> {/* Handles everything automatically */}
    </>
  );
}
```

### Hide Navigation on Specific Pages

Edit `src/components/navigation-wrapper.tsx`:

```tsx
const hideNavigationPaths = [
  '/login',
  '/reports',
  '/your-new-page', // Add here
];
```

### Custom Floating Action Button

```tsx
import { FloatingActionButton } from '@/components/ui/floating-action-button';

// Custom destination
<FloatingActionButton href="/custom-page" />

// Custom action
<FloatingActionButton onClick={() => handleCustomAction()} />

// Custom icon
<FloatingActionButton icon={<CustomIcon />} />

// Custom styling
<FloatingActionButton className="bottom-32 right-8" />
```

### Custom Bottom Navigation

```tsx
import { BottomNav } from '@/components/ui/bottom-nav';
import { Home, Settings, User } from 'lucide-react';

const customNavItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: User, label: 'Account', href: '/account' },
];

<BottomNav items={customNavItems} />
```

## 🌍 Adding Translations

### 1. Add to English (`messages/en.json`)
```json
{
  "Navigation": {
    "home": "HOME",
    "schedule": "SCHEDULE",
    "reports": "REPORTS",
    "profile": "PROFILE",
    "newItem": "NEW ITEM"  // Add here
  }
}
```

### 2. Add to French (`messages/fr.json`)
```json
{
  "Navigation": {
    "home": "ACCUEIL",
    "schedule": "PLANNING",
    "reports": "RAPPORTS",
    "profile": "PROFIL",
    "newItem": "NOUVEL ÉLÉMENT"  // Add here
  }
}
```

### 3. Add to Dutch (`messages/nl.json`)
```json
{
  "Navigation": {
    "home": "HOME",
    "schedule": "PLANNING",
    "reports": "RAPPORTEN",
    "profile": "PROFIEL",
    "newItem": "NIEUW ITEM"  // Add here
  }
}
```

## 🎨 Styling Reference

### Color Tokens
```tsx
// Active state
text-[#064e3b]  // Dark green

// Inactive state
text-slate-400  // Light gray

// FAB background
bg-[#a3e635]    // Lime green

// FAB text
text-[#064e3b]  // Dark green
```

### Common Customizations

#### Change FAB Position
```tsx
<FloatingActionButton className="bottom-32 right-8" />
```

#### Change FAB Color
```tsx
<FloatingActionButton className="bg-blue-500 hover:bg-blue-600" />
```

#### Change Navigation Background
```tsx
<BottomNav className="bg-gray-100" />
```

## 🔧 Common Tasks

### Add a New Navigation Item

1. **Add icon import** in `bottom-nav.tsx`:
```tsx
import { Home, Calendar, FileText, User, Settings } from 'lucide-react';
```

2. **Update default items**:
```tsx
function getDefaultNavItems(t: any): NavItem[] {
  return [
    { icon: Home, label: t('home'), href: '/dashboard' },
    { icon: Calendar, label: t('schedule'), href: '/schedule' },
    { icon: FileText, label: t('reports'), href: '/reports' },
    { icon: Settings, label: t('settings'), href: '/settings' }, // New
    { icon: User, label: t('profile'), href: '/profile' },
  ];
}
```

3. **Add translations** (see above)

### Change FAB Default Action

Edit `src/components/ui/floating-action-button.tsx`:

```tsx
export function FloatingActionButton({ 
  onClick, 
  href = '/new-default-page', // Change here
  className,
  icon
}: FloatingActionButtonProps) {
  // ...
}
```

### Show Navigation on Currently Hidden Page

Edit `src/components/navigation-wrapper.tsx`:

```tsx
const hideNavigationPaths = [
  '/login',
  // Remove '/reports' to show navigation on reports page
];
```

### Add Multiple FABs

```tsx
// In your page component
<>
  <FloatingActionButton 
    href="/reports" 
    className="bottom-24 right-6"
  />
  <FloatingActionButton 
    href="/schedule" 
    icon={<Calendar />}
    className="bottom-24 right-24"
  />
</>
```

## 🐛 Troubleshooting

### Navigation Not Showing

**Check 1**: Is the page in `hideNavigationPaths`?
```tsx
// src/components/navigation-wrapper.tsx
const hideNavigationPaths = [
  '/login',
  '/reports',
  // Is your page here?
];
```

**Check 2**: Is `NavigationWrapper` in the layout?
```tsx
// src/app/[locale]/(pages)/layout.tsx
<NavigationWrapper /> // Should be present
```

### Translations Not Working

**Check 1**: Translation key exists in all language files?
```bash
# Search for the key
grep -r "yourKey" messages/
```

**Check 2**: Using correct namespace?
```tsx
const t = useTranslations('Navigation'); // Must be 'Navigation'
```

### FAB Not Navigating

**Check 1**: Is `href` prop correct?
```tsx
<FloatingActionButton href="/reports" /> // Check path
```

**Check 2**: Is route defined in your app?
```bash
# Check if page exists
ls src/app/[locale]/(pages)/reports/
```

### Active State Not Working

**Check**: Is pathname matching correctly?
```tsx
// In bottom-nav.tsx, the active check uses:
const isActive = pathname.includes(item.href);

// If your route is /en/dashboard/settings
// And href is /dashboard
// It will match! ✓
```

## 📦 Component Props Reference

### FloatingActionButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | `undefined` | Custom click handler |
| `href` | `string` | `'/reports'` | Navigation destination |
| `className` | `string` | `undefined` | Additional CSS classes |
| `icon` | `React.ReactNode` | `<Plus />` | Custom icon |

### BottomNav Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[]` | `defaultNavItems` | Navigation items |
| `className` | `string` | `undefined` | Additional CSS classes |

### NavItem Interface

```tsx
interface NavItem {
  icon: React.ElementType;    // Lucide icon component
  label: string;              // Display text
  href: string;               // Navigation path
  translationKey?: string;    // Optional translation key
}
```

## 🚀 Performance Tips

1. **Avoid re-renders**: Navigation is already optimized with conditional rendering
2. **Lazy load icons**: Icons are tree-shaken by Lucide automatically
3. **Memoize custom items**: If passing custom nav items, wrap in `useMemo`

```tsx
const customItems = useMemo(() => [
  { icon: Home, label: 'Home', href: '/home' },
  // ...
], []);

<BottomNav items={customItems} />
```

## 📚 Related Documentation

- [Full Navigation Refactoring Summary](./NAVIGATION_REFACTOR.md)
- [Navigation Architecture Diagrams](./NAVIGATION_ARCHITECTURE.md)
- [Component Guide](./COMPONENT_GUIDE.md)
- [Localization Guide](./LOCALIZATION_GUIDE.md)

## 💡 Tips & Best Practices

1. **Keep navigation items to 4-5 max** for mobile usability
2. **Use clear, concise labels** (preferably single words)
3. **Choose recognizable icons** from Lucide React
4. **Test on mobile devices** for touch target sizes
5. **Ensure contrast ratios** meet WCAG AA standards
6. **Add loading states** for async navigation actions
7. **Consider haptic feedback** for better UX on mobile

## 🎓 Examples

### Example 1: Admin-Only Navigation Item

```tsx
// In bottom-nav.tsx
function getDefaultNavItems(t: any, userRole?: string): NavItem[] {
  const items = [
    { icon: Home, label: t('home'), href: '/dashboard' },
    { icon: Calendar, label: t('schedule'), href: '/schedule' },
    { icon: FileText, label: t('reports'), href: '/reports' },
    { icon: User, label: t('profile'), href: '/profile' },
  ];

  if (userRole === 'admin') {
    items.push({ icon: Settings, label: t('admin'), href: '/admin' });
  }

  return items;
}
```

### Example 2: Conditional FAB

```tsx
// In navigation-wrapper.tsx
export function NavigationWrapper() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const canCreateReport = session?.user?.role === 'worker';
  
  return (
    <>
      {canCreateReport && <FloatingActionButton />}
      <BottomNav />
    </>
  );
}
```

### Example 3: Custom FAB with Confirmation

```tsx
import { FloatingActionButton } from '@/components/ui/floating-action-button';

function MyPage() {
  const handleCreate = () => {
    if (confirm('Create new report?')) {
      router.push('/reports');
    }
  };

  return (
    <>
      {/* Page content */}
      <FloatingActionButton onClick={handleCreate} />
    </>
  );
}
```
