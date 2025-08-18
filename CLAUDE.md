# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WXT + React browser extension using TypeScript. This is a cross-browser extension that supports both Chrome and Firefox.

### Tech Stack

- **WXT**: Modern web extension framework
- **React 19**: UI framework with automatic JSX transform
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: React component library built on Radix UI
- **i18next & react-i18next**: Internationalization with runtime language switching
- **Playwright**: E2E testing for browser extensions
- **pnpm**: Package manager

## Development Commands

### Essential Commands

```bash
# Development
pnpm dev           # Chrome development with hot reload
pnpm dev:firefox   # Firefox development

# Code Quality (ALWAYS run before committing)
pnpm lint          # Run all linters
pnpm fix           # Auto-fix issues

# Building
pnpm build         # Production build (Chrome)
pnpm build:firefox # Production build (Firefox)

# Testing
pnpm test:e2e      # Run E2E tests (builds first)
```

### Testing Changes

1. Run `pnpm lint` to check for issues
2. Run `pnpm fix` to auto-fix
3. Test in browser with `pnpm dev`
4. Verify production build with `pnpm build`
5. Run E2E tests with `pnpm test:e2e`

## Architecture

### Directory Structure

```
entrypoints/
├── background.ts       # Background service worker
├── content.ts         # Content scripts
├── global.css         # Global Tailwind CSS imports
└── popup/             # Popup UI
    ├── App.tsx        # Main React component
    ├── main.tsx       # React entry point
    └── index.html     # Entry HTML

components/
└── ui/                # shadcn/ui components

lib/
├── i18n.ts            # i18n configuration and initialization
├── locales/           # Translation files
│   ├── en.json       # English translations
│   └── ja.json       # Japanese translations
├── storage/           # WXT Storage definitions
│   ├── index.ts      # Storage exports
│   └── preferences.ts # User preferences storage
└── utils.ts           # Utility functions (e.g., cn helper)

types/
└── i18n.d.ts          # Translation type definitions

e2e/
├── extension-fixtures.ts  # Playwright fixtures for extension testing
├── pages/                 # Page Object Models
│   └── popup.ts          # Popup page interactions
└── *.spec.ts             # E2E test files
```

### Extension Entry Points

- **`entrypoints/background.ts`**: Background service worker using `defineBackground()`
- **`entrypoints/content.ts`**: Content scripts with match patterns using `defineContentScript()`
- **`entrypoints/popup/`**: React popup UI
  - `App.tsx`: Main React component
  - `main.tsx`: React entry point
  - `index.html`: Entry HTML file

### Key Patterns

- WXT's `define*` functions for extension APIs
- React 19 with automatic JSX transform (no React import needed)
- TypeScript with `.ts` extension imports allowed
- ESLint + Prettier for code quality
- Page Object Model pattern for E2E tests

### Key Configuration Files

- `wxt.config.ts`: WXT configuration for extension build
- `components.json`: shadcn/ui component configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `postcss.config.mjs`: PostCSS configuration for Tailwind
- `tsconfig.json`: TypeScript configuration with path aliases
- `playwright.config.ts`: Playwright E2E test configuration

## Development Workflow

### Before Making Changes

1. Understand WXT's API structure (defineBackground, defineContentScript, etc.)
2. Follow existing React component patterns in popup/
3. Use browser.\* APIs for WebExtensions

### After Making Changes

1. **ALWAYS run**: `pnpm lint` and fix any issues
2. **If errors**: Run `pnpm fix` for auto-fixing
3. **Test locally**: `pnpm dev` to verify changes work
4. **Commit format**: `type(scope): description` (conventional commits enforced)

## UI Development

### Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are installed to `components/ui/` and can be imported using:

```typescript
import { Button } from "@/components/ui/button";
```

### Styling

- **Tailwind CSS**: Use utility classes for styling
- **Global Styles**: Defined in `entrypoints/global.css` with `@import "tailwindcss"`
- **CSS Variables**: Theme colors are defined as CSS variables for shadcn/ui theming
- **Component Variants**: Use CVA (class-variance-authority) for component variants

### Import Aliases

- `@/`: Maps to project root for cleaner imports (shadcn/ui compatibility)
- `@/components`: Component directory
- `@/lib`: Utility functions directory
- `@/assets`: Static assets directory

## Data Persistence

### Storage Management

- **WXT Storage API**: Use for all persistent data (preferred over browser.storage)
- **Storage Structure**: `lib/storage/` directory for storage definitions
  - `preferences.ts`: User preferences (language settings, etc.)
  - Type-safe storage items using `storage.defineItem()`
- **Storage watching**: Use `.watch()` method for reactive updates across extension contexts

## Internationalization

- Uses `react-i18next` for runtime language switching
- Translation files in `lib/locales/*.json` (English and Japanese)
- Language preference stored via WXT Storage (`userPreferences`)
- Type-safe translation keys via TypeScript definitions
- Use `useTranslation()` hook in React components
- **IMPORTANT**: Follow UX writing guidelines in @docs/guides/md-ux-writing-style-guide.md for all UI text

## Important Notes

- Husky runs lint-staged on pre-commit (Prettier → ESLint → TypeScript check)
- No GitHub @ mentions in commits (custom rule)
- Build outputs: `.output/chrome-mv3/` and `.output/firefox-mv*/`
- WXT handles manifest.json generation automatically
- Popup width is fixed at 350px for consistent UI across browsers
