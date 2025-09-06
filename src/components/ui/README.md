# Skeleton Loading Components

This directory contains skeleton loading components that provide a better user experience while content is loading.

## Components

### ResourceSkeleton
A skeleton specifically designed for the resources page layout with images, titles, descriptions, and buttons.

```tsx
import ResourceSkeleton from "@/components/ui/ResourceSkeleton";

// Show 5 skeleton items
<ResourceSkeleton count={5} />
```

### CardSkeleton
A generic card skeleton that can be customized for different content types.

```tsx
import CardSkeleton from "@/components/ui/CardSkeleton";

// Basic usage
<CardSkeleton />

// Customized
<CardSkeleton 
  imageHeight="h-64"
  titleHeight="h-8"
  descriptionLines={4}
  showButtons={false}
/>
```

### GridSkeleton
A grid layout skeleton that displays multiple CardSkeleton components.

```tsx
import GridSkeleton from "@/components/ui/GridSkeleton";

// 3x2 grid with 6 items
<GridSkeleton count={6} columns={3} />

// Custom card properties
<GridSkeleton 
  count={4} 
  columns={2}
  cardProps={{
    imageHeight: "h-48",
    descriptionLines: 2,
    buttonCount: 1
  }}
/>
```

### ContentSkeleton
A simple text content skeleton for paragraphs or descriptions.

```tsx
import ContentSkeleton from "@/components/ui/ContentSkeleton";

// 3 lines of text
<ContentSkeleton lines={3} />

// Custom styling
<ContentSkeleton lines={5} className="mt-4" />
```

## Usage Examples

### In a Resource Page
```tsx
import { Suspense } from "react";
import ResourceSkeleton from "@/components/ui/ResourceSkeleton";

<Suspense fallback={<ResourceSkeleton count={5} />}>
  {/* Your actual content */}
</Suspense>
```

### In a Grid Layout
```tsx
import GridSkeleton from "@/components/ui/GridSkeleton";

// While loading
<GridSkeleton count={8} columns={4} />

// Or as a fallback
<Suspense fallback={<GridSkeleton count={8} columns={4} />}>
  {/* Your grid content */}
</Suspense>
```

### Custom Card Layout
```tsx
import CardSkeleton from "@/components/ui/CardSkeleton";

<CardSkeleton 
  imageHeight="h-32"
  imageWidth="w-32"
  titleHeight="h-5"
  descriptionLines={2}
  showButtons={true}
  buttonCount={1}
  className="max-w-sm"
/>
```

## Styling

All skeleton components use:
- `animate-pulse` for the loading animation
- `bg-gray-200 dark:bg-gray-700` for light/dark mode compatibility
- Responsive design patterns
- Consistent spacing and sizing

## Best Practices

1. **Match the skeleton to your actual content layout** - The skeleton should closely resemble the final content
2. **Use appropriate counts** - Show enough skeleton items to indicate the expected content amount
3. **Consider loading states** - Use Suspense boundaries for better user experience
4. **Test in both light and dark modes** - Ensure visibility in all themes
5. **Keep skeletons lightweight** - Don't add unnecessary complexity to skeleton components

