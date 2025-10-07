# Driver Portal (Fleet Master)

A mobile-first web application for fleet drivers to authenticate, submit daily status forms, and review their dashboard. Built with React, TypeScript, Vite, and Material UI. Supports
internationalization (English/Arabic) and RTL layouts.

<p align="center">
  <a href="https://nodejs.org/"><img alt="Node 18+" src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" /></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/build-vite%206-blue" /></a>
  <a href="https://mui.com/"><img alt="MUI" src="https://img.shields.io/badge/UI-MUI%207-1f6feb" /></a>
  <a href="https://github.com/medmoe/driver-portal/actions"><img alt="CI" src="https://img.shields.io/badge/tests-vitest-informational" /></a>
</p>

## Table of Contents

- Overview
- Features
- Tech Stack
- Prerequisites
- Quick Start
- Configuration
- Project Structure
- Internationalization and RTL
- Testing
- Build Output
- Deployment
- Accessibility
- Troubleshooting
- FAQ
- Contributing
- License

## Overview

The Driver Portal enables drivers to securely authenticate and report their daily status (vehicle statistics, route, and notes). It provides a localized UI supporting English and Arabic with proper
RTL layout behavior.

## Features

- Driver authentication (DOB, phone, access code)
- Dashboard with daily status list and pagination
- Create, view, and edit Daily Status (vehicle stats, route, notes)
- Internationalization (i18next) with Arabic and English translations
- RTL support via MUI and stylis-plugin-rtl
- Axios-based API integration with environment-aware base URL
- Responsive UI with Material UI components
- State management with Zustand
- Unit and component testing with Vitest and Testing Library

## Tech Stack

- React 18, TypeScript
- Vite 6
- Material UI (MUI v7), MUI X Date Pickers
- i18next + react-i18next + language detector + HTTP backend
- Axios, date-fns, React Router v6
- Zustand for light state management
- Vitest, @testing-library/* for tests

## Prerequisites

- Node.js 18+ and npm 9+

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Start the dev server
npm run dev

# 3) Build for production
npm run build

# 4) Preview the production build locally
npm run preview

# 5) Lint and test
npm run lint
npm test
```

## Configuration

API endpoints are configured via src/config.ts and Vite environment variables.

- Development API (default): http://localhost:8000/
- Production API (default): https://api.fleetmasters.net/

The environment is derived from:

- import.meta.env.VITE_NODE_ENV or import.meta.env.MODE
- Values: `development` or `production`

To override, set Vite env variables in a .env file or via CLI, for example:

```bash
# .env.local (used by Vite)
VITE_NODE_ENV=development
```

If you fork this project and need a different API URL, adjust src/config.ts accordingly.

### Environment variables reference

- VITE_NODE_ENV: Controls which env block is used in src/config.ts (`development` or `production`).

## Project Structure (high-level)

- src/
    - components/
        - auth/ — Authentication views and logic
        - dashboard/ — Dashboard and list views
        - daily-status/ — Create/Edit/View daily status
        - dialogs/ — Dialogs including DailyStatusFormDialog
        - common/ — Shared components (Header, etc.)
    - locales/
        - en/translation.json — English strings
        - ar/translation.json — Arabic strings (RTL)
    - types.ts — Shared TypeScript types
    - App.tsx — Routing and app layout
    - constants.ts, config.ts — API and env config

## Internationalization and RTL

- i18next is configured with language detection and HTTP backend.
- Arabic (ar) and English (en) translations are provided under src/locales.
- RTL support is enabled via stylis-plugin-rtl and MUI direction when Arabic is active.

## Testing

- Test runner: Vitest
- DOM: jsdom
- Utilities: @testing-library/react, @testing-library/user-event, @testing-library/jest-dom

Run all tests:

```bash
npm test
```

## Build Output

- Build artifacts are generated into the dist/ directory by Vite.
- TypeScript project references are used (tsc -b) before vite build.

## Deployment

This app can be deployed as a static site.

- The package.json sets a homepage suitable for GitHub Pages: `https://medmoe.github.io/driver-portal`.
- When deploying under a subpath (e.g., GitHub Pages), ensure Vite's `base` matches that subpath, e.g. in vite.config.ts:
  ```ts
  export default defineConfig({
    plugins: [react()],
    base: '/driver-portal/',
  })
  ```
- Typical GitHub Pages flow:
    - Build: `npm run build`
    - Serve from the `dist/` folder using your hosting provider or a GitHub Pages workflow.

## Accessibility

- Uses semantic HTML and MUI components with built-in accessibility features.
- RTL and LTR are supported for improved readability in Arabic and English.

## Troubleshooting

- Blank page after deploying to GitHub Pages: verify the `base` in vite.config.ts matches your repository name and that `homepage` in package.json matches your deployment URL.
- API calls fail locally: ensure your backend is running at http://localhost:8000/ or update src/config.ts.

## FAQ

- How do I change the API URL?
    - Edit src/config.ts to point to your API; optionally control environment with `VITE_NODE_ENV`.
- How do I add a new language?
    - Add a new folder under src/locales and include translation.json. Wire it in your i18n setup if needed.

## Contributing

- Use feature branches and submit PRs.
- Run lint and tests before pushing.

## License

This project is part of the Fleet Master suite. If no license file is present, all rights are reserved by the maintainers. Contact the repository owner for usage terms.
