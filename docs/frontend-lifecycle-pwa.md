# Frontend Lifecycle Documentation  
**Game Journal v2 – React + Vite + TypeScript + Offline‑First PWA**

---

## 1. Overview

This document describes the **complete lifecycle of the frontend PWA**, from application boot to authentication, offline persistence, background synchronization, routing, and failure handling.

The frontend is designed around:

- **Offline‑first correctness**
- **Local‑source‑of‑truth (IndexedDB)**
- **Deterministic UI state**
- **Explicit trust boundaries**
- **Graceful degradation under network failure**

The frontend never assumes the backend is reachable.

---

## 2. Application Boot & Initialization

### Entry Point

- `main.tsx` → mounts the React tree
- Router, providers, and layout are initialized synchronously

### Boot Sequence

```
Browser loads bundle
  |
  v
Initialize React
  |
  v
AuthProvider
  |
  v
AppShell
  |
  v
Route resolution
```

At no point does the app block rendering on network availability.

---

## 3. Global Providers & Responsibilities

### AuthProvider

Responsibilities:

- Determines authentication state from `localStorage`
- Owns login / logout / forceLogout semantics
- Clears IndexedDB on forced logout
- Registers a backend‑driven auth invalidation handler

**Invariant:**  
If `auth.status === 'authenticated'`, a token exists locally.

---

### AppShell

Responsibilities:

- Layout orchestration (Header / Nav / Content)
- Theme synchronization (CSS variables + meta theme‑color)
- Toast system
- **Activation of background sync**

```
auth.status === 'authenticated'
        |
        v
useJournalSync(true)
```

Sync is disabled when logged out.

---

## 4. Routing & Access Control

### Route Types

- **Public**
  - `/`
  - `/login`
  - `/register`

- **Protected**
  - `/journal`
  - `/entries/:id`
  - `/search`
  - `/statistics`
  - `/settings`

### ProtectedRoute Lifecycle

```
Route match
  |
  v
useAuth()
  |
  |-- logged_out --> redirect "/"
  |
  v
Render page
```

**Invariant:**  
Protected pages never render in a logged‑out state.

---

## 5. Authentication Lifecycle (Frontend)

### Login / Registration

```
User submits form
  |
  v
POST /auth/*
  |
  |-- success
  |
  v
Persist token + identity
  |
  v
AuthContext.login()
  |
  v
Redirect → /journal
```

### Token Injection

- Axios request interceptor attaches `Authorization: Bearer <token>`
- Token is never manually passed by components

---

### Auth Invalidation (Backend‑Driven)

```
Backend returns 401
  |
  v
Axios interceptor
  |
  v
handleAuthInvalid()
  |
  v
forceLogout()
```

This guarantees frontend and backend auth states never drift silently.

---

## 6. Offline‑First Data Model

### Local Source of Truth

- **IndexedDB is authoritative**
- UI always reads from local storage
- Backend is used only to reconcile state

```
UI → IndexedDB → Render
        |
        v
   Backend Sync (best‑effort)
```

---

### IndexedDB Guarantees

- Entries always have:
  - `localId`
  - `synced`
  - `deleted`
- Partial or malformed entries cannot exist

---

## 7. Journal Entry Lifecycle

### Create (Offline‑First)

```
User submits form
  |
  v
Validate locally
  |
  v
Write to IndexedDB (synced=false)
  |
  v
UI updates immediately
  |
  v
Background sync (if online)
```

### Update

```
Edit entry
  |
  v
Local update (synced=false)
  |
  v
UI updates
  |
  v
PATCH backend (if _id exists)
```

### Delete

```
Mark deleted locally
  |
  v
Hide from UI
  |
  v
DELETE backend (if exists)
  |
  v
Local purge after success
```

**Invariant:**  
No UI mutation depends on backend success.

---

## 8. Background Synchronization

### Central Sync Engine

- `useJournalSync`
- `syncJournalEntries`

Guarantees:

- Single sync at a time
- Safe retries
- Order‑preserving reconciliation

### Sync Cases

1. Local delete
2. Local create (POST)
3. Local update (PATCH)

Failures **never** corrupt local state.

---

## 9. Pagination & Fetching

### Journal Feed

```
Render → IndexedDB
  |
  v
If empty:
  |
  v
Fetch backend page
  |
  v
Materialize locally
```

- Backend pages are merged into IndexedDB
- UI never appends remote results directly

---

## 10. Search Lifecycle

### Dual‑Mode Search

```
Search request
  |
  |-- online --> backend search
  |
  |-- offline --> local scan
```

Cursor behavior resets when source changes to preserve UX correctness.

---

## 11. Statistics Lifecycle

```
Request statistics
  |
  |-- online --> backend aggregate
  |
  |-- offline --> local computation
```

Statistics always reflect **available truth**, not optimistic assumptions.

---

## 12. Error Handling Philosophy

- Network errors are non‑fatal
- All failures degrade gracefully
- Toasts communicate state, not blame
- UI never blocks indefinitely

---

## 13. Trust Boundary Model (Frontend)

```
[ User Input ]
      |
      v
[ React Components ]
      |
      v
[ Validation Boundary ]
(Local form validation)
      |
      v
[ Local Trust Zone ]
IndexedDB
      |
      v
[ Network Boundary ]
Axios + Interceptors
      |
      v
[ Backend API ]
```

Each boundary re‑establishes assumptions explicitly.

---

## 14. Security Guarantees

- Tokens stored only in localStorage
- Tokens attached centrally (Axios)
- No backend data trusted without reconciliation
- Forced logout on auth invalidation
- No backend dependency for UI continuity

---

## 15. Threat Model (Frontend)

### T1: Network Failure

**Mitigation:**  
Offline‑first architecture, IndexedDB authority.

---

### T2: Backend Unavailability

**Mitigation:**  
Local rendering + deferred sync.

---

### T3: Token Expiry / Revocation

**Mitigation:**  
Centralized auth invalidation handler.

---

### T4: Data Loss on Logout

**Mitigation:**  
Logout blocked when unsynced data exists.

---

### T5: UI / Backend State Drift

**Mitigation:**  
Backend never mutates UI state directly.

---

### Explicit Non‑Goals

- Preventing XSS in the browser (assumed trusted build)
- Protecting against compromised devices
- Multi‑device conflict resolution

---

## 16. Why These Decisions

- **IndexedDB as source of truth:** guarantees offline correctness
- **Fire‑and‑forget sync:** UX over strict consistency
- **Centralized auth handling:** no silent auth drift
- **Router‑level protection:** no conditional rendering hacks
- **Explicit trust boundaries:** predictable mental model

---

## 17. Failure Philosophy

> The UI must never lie.  
> The UI must never block.  
> The UI must always remain usable.

This frontend prefers **eventual consistency with honesty** over fragile immediacy.
