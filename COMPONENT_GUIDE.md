# GoboClean Rapport - Component Guide

This guide explains how to use the reusable shadcn components throughout the application.

## Brand Colors

The application uses a consistent color scheme based on lime green and emerald/teal:

- **Primary**: Lime Green (`#84cc16`) - Used for primary actions and CTAs
- **Secondary**: Emerald/Teal (`#059669`) - Used for headers and secondary elements
- **Accent**: Bright Lime (`#bef264`) - Used for highlights and accents

## Core Components

### Button Component

The Button component is the primary interactive element. Use the `default` variant for primary actions.

```tsx
import { Button } from '@/components/ui/button';

// Primary button (lime green)
<Button>Click Me</Button>

// With icon
<Button>
  <ArrowRight className="mr-2 h-4 w-4" />
  Continue
</Button>

// Loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>

// Other variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Input Component

The Input component is styled with a modern, clean look with smooth transitions.

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>

// With error state
<Input
  id="email"
  type="email"
  placeholder="you@example.com"
  className={errors.email ? 'border-red-500' : ''}
/>
{errors.email && (
  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
)}

// Password input
<Input
  id="password"
  type="password"
  placeholder="Enter password"
/>
```

### Checkbox Component

The Checkbox component uses Radix UI for accessibility and smooth animations.

```tsx
import { Checkbox } from '@/components/ui/checkbox';

const [checked, setChecked] = useState(false);

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <label
    htmlFor="terms"
    className="text-sm font-medium cursor-pointer"
  >
    Accept terms and conditions
  </label>
</div>
```

### Logo Component

The Logo component displays the GoboClean Rapport branding consistently.

```tsx
import { Logo } from '@/components/ui/logo';

// Default variant (full logo with text)
<Logo />

// Compact variant (smaller, horizontal layout)
<Logo variant="compact" />

// Without text
<Logo showText={false} />

// Custom styling
<Logo 
  className="my-custom-class"
  iconClassName="text-lime-500"
/>
```

### Label Component

Use the Label component for form field labels.

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email Address</Label>

// Uppercase style (matching login design)
<Label 
  htmlFor="email" 
  className="text-xs font-bold uppercase tracking-wide text-slate-700"
>
  Work Email
</Label>
```

### Card Component

Use Card components for content containers.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Design Patterns

### Form Layout

Follow this pattern for consistent form layouts:

```tsx
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  <div className="space-y-2">
    <Label 
      htmlFor="field" 
      className="text-xs font-bold uppercase tracking-wide text-slate-700"
    >
      Field Label
    </Label>
    <Input
      id="field"
      type="text"
      placeholder="Enter value"
      {...register('field')}
      className={errors.field ? 'border-red-500' : ''}
      disabled={isLoading}
    />
    {errors.field && (
      <p className="text-sm text-red-500 mt-1">{errors.field.message}</p>
    )}
  </div>

  <Button type="submit" className="w-full" disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </>
    ) : (
      'Submit'
    )}
  </Button>
</form>
```

### Page Layout

For full-page layouts with centered content:

```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
  <div className="w-full max-w-md">
    {/* Your content here */}
  </div>
</div>
```

### Header with Logo

For pages with a branded header:

```tsx
<div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-t-3xl px-8 py-12 shadow-2xl">
  <Logo />
</div>
```

## Color Utilities

Use Tailwind classes for consistent colors:

### Primary (Lime Green)
- Background: `bg-lime-500`, `bg-lime-600`
- Text: `text-lime-400`, `text-lime-500`
- Border: `border-lime-500`
- Shadow: `shadow-lime-500/30`

### Secondary (Emerald/Teal)
- Background: `bg-emerald-800`, `bg-teal-900`
- Text: `text-emerald-700`
- Border: `border-emerald-700`

### Neutral (Slate)
- Background: `bg-slate-900`, `bg-slate-800`, `bg-slate-700`
- Text: `text-slate-700`, `text-slate-600`, `text-slate-500`
- Border: `border-slate-300`

## Icons

The app uses Lucide React icons. Common icons:

```tsx
import { 
  Home,          // Logo/home icon
  ArrowRight,    // Navigation/forward
  Check,         // Success/completed
  Loader2,       // Loading spinner
  Eye,           // Show/visibility
  EyeOff,        // Hide
  AlertCircle,   // Warning/error
  Info,          // Information
  X,             // Close/cancel
} from 'lucide-react';

// Usage
<Home className="w-5 h-5 text-lime-400" strokeWidth={2.5} />
<Loader2 className="w-4 h-4 animate-spin" />
```

## Best Practices

1. **Consistency**: Always use the provided components instead of creating custom ones
2. **Accessibility**: Use proper labels with `htmlFor` attributes matching input `id`s
3. **Loading States**: Always show loading indicators for async operations
4. **Error Handling**: Display clear error messages below form fields
5. **Responsive**: Use responsive classes (`sm:`, `md:`, `lg:`) for different screen sizes
6. **Color Scheme**: Stick to the lime green primary color for all CTAs
7. **Spacing**: Use consistent spacing with Tailwind's spacing scale (`space-y-2`, `space-y-4`, `space-y-6`)

## Example: Complete Form Page

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ExamplePage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Your API call here
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-t-3xl px-8 py-12 shadow-2xl">
          <Logo />
        </div>

        <div className="bg-white rounded-b-3xl shadow-2xl px-8 py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="name" 
                className="text-xs font-bold uppercase tracking-wide text-slate-700"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-xs font-bold uppercase tracking-wide text-slate-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-bold uppercase tracking-wide bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-slate-900 shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Component Export Index

For convenience, you can create a barrel export file:

```tsx
// src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export { Checkbox } from './checkbox';
export { Logo } from './logo';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { useToast } from './use-toast';
export { Toaster } from './toaster';
```

Then import multiple components at once:

```tsx
import { Button, Input, Label, Logo } from '@/components/ui';
```
