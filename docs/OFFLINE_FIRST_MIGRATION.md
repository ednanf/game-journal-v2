
# Transitioning an Online-First App to Offline-First

(This file documents the full journey and concrete implementation of converting an online-first React PWA into an offline-first application.)

---

## Part 1 — General Steps to Make an App Offline-First

### 1. Redefine the Source of Truth
- Move authority from backend to local storage (IndexedDB).
- UI must work without backend availability.
- Backend becomes a replica, not the driver.

### 2. Introduce Local Persistence
- Use IndexedDB (via `idb`).
- Define schema explicitly.
- Persist full domain entities locally.

### 3. Introduce Client-Side Identity
- Add `localId` (UUID) for all entries.
- Backend `_id` becomes optional metadata.
- Enables offline creation and reconciliation.

### 4. Decouple UI from Backend
- UI reads/writes only to IndexedDB.
- UI never performs CRUD network requests.

### 5. Implement a Dedicated Sync Layer
- One sync function.
- Single writer to backend.
- UI never mutates backend directly.

### 6. Make Operations Idempotent
- Especially DELETE.
- `404` is treated as success.
- Sync must be retry-safe.

### 7. Use Tombstones for Deletes
- Mark entries as `deleted: true`.
- Remove only after successful sync.

### 8. Treat Network State as Advisory
- `navigator.onLine` is only a hint.
- Backend cold starts are normal.
- Never block UI.

### 9. Honest, Quiet UX
- Instant local saves.
- Minimal sync visibility.
- Status is discoverable, not noisy.

### 10. Apply Same Pattern to Search
- UI requests “results”, not backend.
- Service layer chooses local vs remote.

---

## Part 2 — What Was Implemented in This Project

### PWA Setup
- Added `vite-plugin-pwa`
- Configured manifest and icons
- Matched theme color with CSS
- Prevented dark-mode flash

### IndexedDB
- Installed `idb`
- Created `db.ts`
- `localId` as keyPath

### Domain Types
- Split backend and local types
- Introduced `JournalEntryBase`
- Created `OfflineJournalEntry`

### Repository Layer
- `journalRepository` for all IndexedDB access
- UI uses repository exclusively

### CRUD Refactor
- Create → local only
- Update → local only
- Delete → local tombstone only

### Sync Engine
- `syncJournalEntries` owns backend writes
- POST for new entries
- PATCH for updates
- DELETE idempotent (404 = success)
- Stops on first failure
- Retry-safe

### Pagination
- Backend pagination feeds IndexedDB
- UI reads only from IndexedDB
- Debounced infinite scroll

### Search Refactor
- Introduced `searchService`
- Unified search contract
- Prepares local fallback

### Sync Status UX
- Settings-only indicator
- Honest states (pending, offline, synced)
- No UI clutter

---

## Final Principle

UI mutates local state.  
Sync reconciles intent.  
Backend is just another replica.


---

## Appendix — Architecture Diagrams (ASCII)

### 1. Online-First (Before)

```
┌──────────────┐
│   React UI   │
└──────┬───────┘
       │ HTTP (CRUD)
       ▼
┌──────────────┐
│   Backend    │
│  (MongoDB)   │
└──────────────┘
```

Characteristics:
- UI blocked by network
- Backend is single source of truth
- Offline = broken UX

---

### 2. Offline-First (After)

```
┌──────────────┐
│   React UI   │
└──────┬───────┘
       │ local read/write
       ▼
┌──────────────┐
│  IndexedDB   │
│ (Repository) │
└──────┬───────┘
       │ async reconciliation
       ▼
┌──────────────┐
│ Sync Engine  │
│ (Single WR)  │
└──────┬───────┘
       │ HTTP (eventual)
       ▼
┌──────────────┐
│   Backend    │
│  (MongoDB)   │
└──────────────┘
```

Key idea:
- UI never talks to backend
- IndexedDB is canonical
- Backend converges later

---

### 3. Identity Model

```
Local Entry
───────────
localId = UUID
_id     = undefined
synced  = false

        │ POST
        ▼

Synced Entry
────────────
localId = UUID
_id     = MongoID
synced  = true
```

Invariant:
- `localId` never changes
- `_id` is attached later

---

### 4. Delete Lifecycle (Tombstone)

```
[User deletes entry]
        │
        ▼
┌─────────────────────┐
│ deleted = true      │
│ synced  = false     │
│ (IndexedDB)         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Sync Engine DELETE  │
│ 200 or 404 = OK     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Remove locally      │
│ (converged state)   │
└─────────────────────┘
```

DELETE is idempotent.

---

### 5. Sync Decision Flow

```
┌──────────────┐
│ Local change │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ navigator    │
│ .onLine ?    │
└──────┬───────┘
   no  │ yes
       ▼
┌──────────────┐     ┌──────────────┐
│ Save locally │     │ Attempt sync │
│ retry later │     └──────┬───────┘
└──────────────┘            │
                             ▼
                     ┌──────────────┐
                     │ Backend up ? │
                     └──────┬───────┘
                        no  │ yes
                             ▼
                     ┌──────────────┐
                     │ Retry later  │
                     │ (no error)   │
                     └──────────────┘
```

---

### 6. Offline-First Search Architecture

```
Search UI
   │
   ▼
searchService
   │
   ├── backend reachable ──► Remote search
   │                          │
   │                          ▼
   │                    Normalize + cache
   │                          │
   │                          ▼
   │                    IndexedDB
   │
   └── backend unreachable ─► Local search
                              │
                              ▼
                        IndexedDB filter
```

Guarantee:
- Search always returns something sensible
- UI does not care about data source

---

### 7. Single Writer Rule

```
UI Layer
  │
  │ (NO HTTP)
  ▼
IndexedDB
  │
  │ (ONLY PLACE)
  ▼
Sync Engine
  │
  │ (HTTP)
  ▼
Backend
```

Breaking this rule causes:
- race conditions
- double deletes
- ghost entries

---
