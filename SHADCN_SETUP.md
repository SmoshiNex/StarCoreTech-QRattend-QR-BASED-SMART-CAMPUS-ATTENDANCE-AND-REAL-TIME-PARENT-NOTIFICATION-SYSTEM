# shadcn/ui Setup Complete! ✨

Your Laravel + Inertia.js + React project is now configured with **shadcn/ui**.

## What's Been Installed

### Dependencies
- ✅ `tailwindcss-animate` - Animation utilities
- ✅ `class-variance-authority` - Component variant management
- ✅ `clsx` - Conditional classnames
- ✅ `tailwind-merge` - Merge Tailwind classes
- ✅ `lucide-react` - Icon library
- ✅ `@radix-ui/react-slot` - Radix UI primitives
- ✅ `shadcn` - CLI tool for adding components

### Configuration Files Updated
- ✅ `vite.config.js` - Added path alias for `@/`
- ✅ `tailwind.config.js` - Added shadcn theme configuration
- ✅ `resources/css/app.css` - Added CSS variables for theming
- ✅ `components.json` - shadcn configuration file

### New Files Created
- ✅ `resources/js/lib/utils.js` - Utility function for class merging
- ✅ `resources/js/components/ui/button.jsx` - Sample Button component
- ✅ `resources/js/Pages/ShadcnDemo.jsx` - Demo page

## How to Use

### 1. Import Components
```jsx
import { Button } from '@/components/ui/button';

export default function MyPage() {
    return (
        <Button variant="default">Click me</Button>
    );
}
```

### 2. Add More Components
Use the shadcn CLI to add any component from the library:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
```

**Or add multiple at once:**
```bash
npx shadcn@latest add button card input form dialog
```

### 3. View Available Components
Browse all available components at: https://ui.shadcn.com/docs/components

### 4. Test the Demo Page
Create a route in `routes/web.php`:
```php
Route::get('/shadcn-demo', function () {
    return Inertia::render('ShadcnDemo');
});
```

Then visit: `http://your-app.test/shadcn-demo`

## Component Structure

All shadcn/ui components are stored in:
```
resources/js/components/ui/
```

These are NOT npm packages - they're copied into your project, so you can customize them freely!

## Dark Mode Support

Dark mode is already configured! To enable it, add the `dark` class to your HTML element:

```jsx
// In your layout or app component
<html className="dark">
```

Or use a theme toggle:
```bash
npx shadcn@latest add theme-toggle
```

## Path Aliases

You can use `@/` to import from `resources/js/`:

```jsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MyComponent from '@/Components/MyComponent';
```

## Customization

### Colors
Edit CSS variables in `resources/css/app.css` to customize colors.

### Theme
Modify `tailwind.config.js` to adjust the theme.

### Components
All components in `resources/js/components/ui/` are editable. Change them as needed!

## Helpful Resources

- 📚 [shadcn/ui Documentation](https://ui.shadcn.com)
- 🎨 [Themes](https://ui.shadcn.com/themes)
- 🔧 [Customization Guide](https://ui.shadcn.com/docs/theming)
- 💡 [Examples](https://ui.shadcn.com/examples)

## Next Steps

1. ✅ Run `npm run dev` to start your development server
2. ✅ Add components as needed with `npx shadcn@latest add [component]`
3. ✅ Build beautiful UIs! 🚀

---

Happy coding! 🎉
