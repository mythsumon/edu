# Project Rules Documentation

This document explains the project rules defined in the `.cursorrules` file and how they apply to this project.

## Core Development Principles

### 1. Avoid Duplicate Work
Before implementing any new component, page, or feature, always check the existing codebase for similar implementations. Reuse existing components, hooks, and utilities rather than creating new ones.

### 2. Leverage Common Components
When developing new pages, prioritize using components from `components/shared/common/`. Avoid using basic HTML elements when a common component is available (e.g., use Button instead of `<button>`).

### 3. Create Common Modules
When logic or components are used in two or more places, extract them into common modules:
- Components → `components/shared/common/` or `components/shared/ui/`
- Custom Hooks → `hooks/`
- Library Configurations → `libs/`
- Utility Functions → `components/shared/utils/`

### 4. Development Workflow
1. Analyze requirements → Check existing implementations
2. Reuse existing code → Create common modules if needed
3. Register common modules → Export in index.ts
4. Import in pages → Use common modules

## Technology Stack

The project uses:
- Framework: Next.js 15.5.3 (App Router)
- Language: TypeScript 5
- React: 19.1.0
- Styling: Tailwind CSS 4 + Ant Design 5.26.7
- State Management: Zustand 5.0.7
- Form Handling: React Hook Form 7.62.0 + Zod 4.0.15
- HTTP Client: Axios 1.11.0
- Icons: Lucide React 0.537.0
- Internationalization: React i18next 15.6.1
- Notifications: React Toastify 11.0.5

## Project Structure

The project follows a specific directory structure:
```
/
├── app/                    # Next.js App Router pages
├── components/             # Component structure
│   ├── layout/            # Layout components (Header, Footer)
│   ├── page/              # Page-specific components
│   └── shared/            # Shared components
│       ├── common/        # Basic UI components
│       ├── ui/            # Complex UI components
│       └── utils/         # Utility components
├── entities/              # Data entities and business logic
├── hooks/                 # Custom hooks
├── libs/                  # External library configurations
├── locales/               # Internationalization support
├── providers/             # Context providers
├── assets/                # Static assets
└── public/                # Public assets
```

## Component Patterns

### Component Classification
1. **Layout**: Page layouts (Header, Footer)
2. **Page**: Components used only on specific pages
3. **Shared/Common**: Reusable basic UI components
4. **Shared/UI**: Complex UI components

### Component Implementation Rules
- Use TypeScript interfaces for prop definitions
- Export components properly (named exports preferred)
- Use index.ts files for managing exports

## Entity Structure

Each feature is organized with:
- `[feature]-types.ts`: TypeScript type definitions
- `[feature]-query.ts`: Data fetching logic
- `[feature]-mutation.ts`: Data modification logic
- `[feature]-dummy.ts`: Development dummy data
- `index.ts`: Export management for the feature

## Styling Guidelines

1. **Primary**: Use Tailwind CSS utility classes
2. **Secondary**: Use CSS modules when needed
3. **Theme Support**: Use CSS variables for theme management
4. **Dark Mode**: Support dark mode with media queries

## State Management

1. **Global State**: Use Zustand for global state management
2. **Local State**: Use useState for component-local state
3. **Form State**: Use React Hook Form + Zod for form handling

## Internationalization

1. **Library**: Use React i18next
2. **Translation Files**: Store in `locales/` directory
3. **Structure**: Key-value structure for translations

## Development Setup

1. **ESLint**: Next.js recommended settings with TypeScript support
2. **TypeScript**: Strict mode enabled with path aliases
3. **Development Server**: Port 3050 with Turbopack

## Naming Conventions

1. **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
2. **Directories**: kebab-case
3. **Utilities/Hooks**: camelCase (`useAutoFocus.ts`, `utils.ts`)
4. **Entities**: kebab-case (`user-types.ts`, `product-query.ts`)

## Coding Conventions

### Import Order
1. React and Next.js
2. External libraries
3. Internal modules (@/ paths) - common modules first

### Export Patterns
1. Prefer named exports
2. Use default export only for main components
3. Manage exports through index.ts files

## Essential Checklist

Before completing any development:

### New Component/Page Development
- [ ] Checked `components/shared/common/` components
- [ ] Searched for similar existing implementations
- [ ] Extracted reusable logic into common modules
- [ ] Updated `index.ts` with new exports

### Code Writing
- [ ] Used common components instead of HTML elements
- [ ] Extracted repetitive logic into custom hooks
- [ ] Placed utility functions in `components/shared/utils/`

### Final Review
- [ ] No duplicate code
- [ ] Maximum reuse of common components
- [ ] Proper placement of new common modules
- [ ] Correctly updated `index.ts` files

## Development Goals

These rules aim to:
1. Maximize code reusability
2. Improve development speed
3. Provide consistent UI/UX
4. Maintain code quality and standards

All developers must strictly adhere to these principles.