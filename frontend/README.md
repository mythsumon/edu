# Management Dashboard Frontend

Production-grade frontend application for management dashboard built with React, TypeScript, and modern tooling.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing
- **TanStack React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── app/              # App shell (routing, providers, layouts, config)
│   ├── shared/           # Cross-cutting concerns
│   │   ├── ui/           # shadcn/ui components (generated)
│   │   ├── lib/          # Utility functions
│   │   ├── constants/    # Constants and enums
│   │   ├── http/         # Axios configuration
│   │   ├── components/   # Generic UI components
│   │   └── stores/       # Global Zustand stores
│   └── modules/          # Feature modules (MVC architecture)
│       └── dashboard/    # Dashboard module example
│           ├── view/     # UI components and pages
│           ├── controller/ # React Query hooks
│           └── model/    # Services, types, mappers
├── components.json       # shadcn/ui configuration
└── package.json
```

## Architecture

### Module-Based MVC Architecture

Each feature module follows MVC-like separation:

- **View** (`modules/<feature>/view/`) - UI components and pages
- **Controller** (`modules/<feature>/controller/`) - React Query hooks (queries & mutations)
- **Model** (`modules/<feature>/model/`) - Axios services, DTO types, and mappers

### Key Principles

- ✅ No direct `axios` calls in UI components
- ✅ React Query manages all server state
- ✅ Zustand only for global client state (auth, UI preferences)
- ✅ Type-safe end-to-end (DTOs → UI models via mappers)
- ✅ Strict import boundaries (`modules` → `shared` only)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `VITE_API_BASE_URL` in `.env` with your backend API URL.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Adding shadcn/ui Components

To add shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

Components will be automatically generated in `src/shared/ui/`.

**Important**: Do not edit generated shadcn components directly. Prefer wrapping them if customization is needed.

## Adding New Features

Follow the feature delivery checklist:

1. **Model**: Create service and types in `modules/<feature>/model/`
2. **Controller**: Create React Query hooks in `modules/<feature>/controller/`
3. **View**: Create pages/components in `modules/<feature>/view/`
4. **Routing**: Register routes in `app/routes/`
5. **Exports**: Export public API in `modules/<feature>/index.ts`

## Available Routes

- `/` - Home page
- `/dashboard` - Dashboard (dummy data)
- `/login` - Login page (placeholder)
- `/404` - Not found page

## Code Style

- TypeScript strict mode enabled
- ESLint configured for React and TypeScript
- Follow existing patterns and folder structure
- Keep components small and focused
- Use TypeScript everywhere (avoid `any`)

## License

Private project

