<img width="80" height="79" alt="logo-icon" src="https://github.com/user-attachments/assets/5015aac8-b465-425b-9b94-96a74b86ca86" />

# Game Journal V2

## Notes

- The backend is hosted on Render’s free tier and may take a moment to wake up after periods of inactivity
- Currently, the auth token is stored in local storage instead of cookies to
  avoid CORS complications, particularly with WebKit on iOS

## About Me

- **Author**: Ednan Rogério Frizzera Filho
- [GitHub](https://github.com/ednanf) • [LinkedIn](https://www.linkedin.com/in/ednanrff/)
- Additional contact info available on my GitHub profile

## About the Project

This is a personal project rebuilt from the ground up — both frontend and backend — to explore and apply offline-first
application design in a real, non-trivial use case.

The frontend is designed to function fully without network connectivity, using IndexedDB as the source of truth and
treating the backend strictly as a synchronization layer. This approach prioritizes resilience, predictable UX, and
clear data ownership boundaries.

Beyond functionality, the project focuses on explicit architectural decisions, well-defined contracts between layers,
and avoiding “magic” abstractions — favoring clarity and correctness over convenience.

## API Specification

Detailed documentation is available for the following parts of the system:

- **Backend architecture & request lifecycle**  
  [View document](https://github.com/ednanf/game-journal-v2/blob/master/docs/backend-lifecycle-v4.md)

- **Frontend offline-first architecture**  
  [View document](https://github.com/ednanf/game-journal-v2/blob/master/docs/frontend-lifecycle-pwa.md)

- **System-wide architecture overview**  
  [View document](https://github.com/ednanf/game-journal-v2/blob/master/docs/system-wide-architecture.md)

- **Public API reference**  
  [Scalar](https://registry.scalar.com/@ednan-frizzera-dev-team/apis/game-journal-v2-api@latest)

## Live Application

🚀 [Live demo](https://journal.frizzera.dev)

*Note: First load may take a moment as the backend wakes up on Render's free tier.*

## Main Technologies

### Languages

- TypeScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- Mongoose
- Zod
- tsx

### Frontend

- React
- Vite (build tool)

### Hosting

- Backend: Render
- Frontend: Vercel

## Dependencies

### Backend

```text
backend (Node.js + Express + TypeScript)
│
├─ Runtime dependencies
│  │
│  ├─ Core server framework
│  │  └─ express               (HTTP server & routing)
│  │
│  ├─ Security & hardening
│  │  ├─ helmet                (secure HTTP headers)
│  │  ├─ cors                  (CORS policy control)
│  │  ├─ express-rate-limit    (rate limiting / abuse protection)
│  │  └─ express-xss-sanitizer (basic XSS input sanitization)
│  │
│  ├─ Authentication & auth utilities
│  │  ├─ jsonwebtoken          (JWT creation & verification)
│  │  ├─ bcryptjs              (password hashing)
│  │  └─ ms                    (human-readable time parsing for tokens)
│  │
│  ├─ Data layer
│  │  └─ mongoose              (MongoDB ODM)
│  │
│  ├─ Validation & correctness
│  │  ├─ zod                   (runtime schema validation)
│  │  └─ validator             (string & format validation helpers)
│  │
│  ├─ HTTP ergonomics
│  │  └─ http-status-codes     (semantic HTTP status constants)
│  │
│  └─ Observability
│     └─ morgan                (HTTP request logging)
│
├─ Development & tooling
│  │
│  ├─ TypeScript & execution
│  │  ├─ typescript            (static typing & build)
│  │  └─ tsx                   (TS execution in dev / watch mode)
│  │
│  ├─ Type definitions
│  │  ├─ @types/node
│  │  ├─ @types/express
│  │  ├─ @types/cors
│  │  ├─ @types/morgan
│  │  ├─ @types/jsonwebtoken
│  │  ├─ @types/validator
│  │  └─ @types/express-xss-sanitizer
│  │
│  └─ Linting & formatting
│     ├─ eslint
│     ├─ @eslint/js
│     ├─ typescript-eslint
│     └─ prettier
│
└─ Scripts
   ├─ dev        → TS execution with watch + env loading
   ├─ build      → TypeScript compilation to /dist
   ├─ start      → Run compiled server
   ├─ check      → Type-check only (no emit)
   ├─ lint       → ESLint (TS-focused)
   ├─ lint:fix   → ESLint with autofix
   ├─ clean      → Remove build & cache artifacts
   └─ rebuild    → Clean install + forced TS rebuild
```

### Frontend

```text
frontend (React + Vite + TypeScript)
│
├─ Runtime dependencies
│  │
│  ├─ Core framework
│  │  ├─ react
│  │  └─ react-dom
│  │
│  ├─ Routing & navigation
│  │  └─ react-router-dom
│  │
│  ├─ Data & persistence
│  │  ├─ axios                (HTTP client)
│  │  └─ idb                  (IndexedDB wrapper, offline-first storage)
│  │
│  ├─ UI & UX utilities
│  │  ├─ react-datepicker     (date input)
│  │  ├─ react-icons          (icon set)
│  │  ├─ react-toastify       (toast notifications)
│  │  └─ react-swiftstacks    (custom library: SwiftUI-like HStack/VStack layout components)
│  │
│  └─ PWA & offline
│     └─ vite-plugin-pwa      (PWA integration for Vite)
│
├─ Development & build tooling
│  │
│  ├─ Build system
│  │  ├─ vite
│  │  ├─ @vitejs/plugin-react
│  │  └─ typescript
│  │
│  ├─ React compilation
│  │  ├─ babel-plugin-react-compiler
│  │  └─ @babel/helpers
│  │
│  ├─ Type definitions
│  │  ├─ @types/react
│  │  ├─ @types/react-dom
│  │  └─ @types/node
│  │
│  ├─ Linting & formatting
│  │  ├─ eslint
│  │  ├─ @eslint/js
│  │  ├─ typescript-eslint
│  │  ├─ eslint-plugin-react-hooks
│  │  ├─ eslint-plugin-react-refresh
│  │  ├─ globals
│  │  └─ prettier
│  │
│  └─ Service worker tooling
│     ├─ workbox-build
│     └─ workbox-window
│
└─ Scripts
   ├─ dev        → Vite dev server
   ├─ build      → TypeScript project build + Vite bundle
   ├─ preview    → Local production preview
   └─ lint       → ESLint over entire codebase
```

_Note: `react-swiftstacks` is a small layout utility I maintain separately, inspired by SwiftUI’s stack primitives._

## Legal

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey)](./LICENSE)
