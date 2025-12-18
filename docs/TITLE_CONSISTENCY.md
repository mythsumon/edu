# Title Consistency Implementation

This document describes how we've implemented consistent title formatting across the education management system.

## Overview

We've standardized title formatting across all pages in the application to ensure a consistent user experience. This includes:

1. **Dashboard Page Titles**
2. **Detail Page Titles** 
3. **Section Headers**
4. **Component Titles**

## Implementation Details

### 1. Common Title Component

We created a reusable `PageTitle` component in `components/common/PageTitle.tsx`:

```tsx
export function PageTitle({ title, subtitle, actions, className = '' }: PageTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
```

### 2. Updated Detail Pages

All detail pages (`attendance/[id]/page.tsx`, `activity/[id]/page.tsx`, `equipment/[id]/page.tsx`) now use the `PageTitle` component:

```tsx
<PageTitle
  title={data.title}
  subtitle={`프로그램명: ${data.programName} | 교육기관: ${data.institutionName} | ${data.grade}학년 ${data.class}반`}
  actions={
    // Action buttons (Edit/Delete or Save/Cancel)
  }
/>
```

### 3. Dashboard Title Consistency

Dashboard components use consistent heading levels:
- Main titles: `h1` (24px, bold)
- Section titles: `h2` (20px, bold) 
- Subsection titles: `h3` (18px, bold)
- Panel titles: `h3` (16px, bold)

### 4. Localization Support

All titles support localization through the `useLanguage` hook:
- Header title: `{t('header.title')}`
- Sidebar title: `{t('sidebar.title')}`
- Page header: `{t('pageHeader.title')}`

## Benefits

1. **Visual Consistency**: All titles follow the same styling patterns
2. **Maintainability**: Single component for title rendering
3. **Accessibility**: Proper heading hierarchy (h1, h2, h3)
4. **Responsive Design**: Titles adapt to different screen sizes
5. **Localization Ready**: All titles can be translated
6. **Reusable**: Common component reduces code duplication

## Style Guide

### Font Sizes
- Page titles (h1): `text-2xl` (24px)
- Section titles (h2): `text-xl` (20px)
- Subsection titles (h3): `text-lg` (18px)
- Panel titles (h3): `text-base` to `text-lg` (16-18px)

### Font Weights
- Page titles: `font-bold`
- Section titles: `font-bold`
- Subsection titles: `font-semibold`
- Panel titles: `font-semibold`

### Colors
- Primary text: `text-gray-900`
- Secondary text (subtitles): `text-gray-500`
- Section headers: `text-gray-900`

### Spacing
- Margin below titles: `mb-1` to `mb-6` depending on hierarchy
- Padding within title containers: Consistent spacing
- Gap between title and actions: `gap-3`

## Components Updated

1. `components/layout/Header.tsx` - Uses localized h1 title
2. `components/layout/Sidebar.tsx` - Uses localized h1 title  
3. `components/dashboard/PageHeader.tsx` - Uses h1 title with filters
4. `components/dashboard/CollapsibleSection.tsx` - Uses h2 title
5. `components/dashboard/ProgramList.tsx` - Uses h2 title
6. `components/dashboard/SearchPanel.tsx` - Uses h3 titles
7. `components/dashboard/SpecialItemDefaultView.tsx` - Uses h3 title
8. `components/dashboard/SpecialItemDetailPanel.tsx` - Uses h3 title
9. `app/attendance/[id]/page.tsx` - Uses PageTitle component
10. `app/activity/[id]/page.tsx` - Uses PageTitle component
11. `app/equipment/[id]/page.tsx` - Uses PageTitle component

This implementation ensures that all titles throughout the application follow a consistent design language while maintaining proper semantic structure for accessibility.