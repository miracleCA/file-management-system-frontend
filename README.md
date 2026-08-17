# File Storage App — Frontend

## Overview

Next.js frontend for the File Storage application.

The UI provides:

- Authentication
- Folder navigation
- File listing
- File uploads
- File downloads
- File sharing
- File/folder movement
- Rename and delete actions
- Breadcrumb navigation
- Empty states
- Upload validation

---

## Setup

### Requirements

- Node.js 20+
- npm
- Backend already running locally

### Install

```bash
npm install
```

### Environment

Create `.env` with the backend API URL expected by the application.

For local development, the backend runs on:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Start

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

---

## Frontend Decisions

### Component structure

The UI is split into focused components rather than putting file-management logic into one large page.

The main responsibilities include:

- File items
- File lists
- Upload UI
- Folder navigation
- Breadcrumbs
- Empty states
- File actions

For example, a file item manages its own temporary UI state such as rename/edit mode while API operations remain handled through the application's API layer.

### State management

No additional global state library was introduced.

File and folder data is server-owned, so API query/mutation state is used for server data.

Local React state is used only for UI concerns such as:

- Editing a filename
- Opening action menus
- Temporary input values
- Local interaction state

This keeps the frontend simpler than introducing Redux or another global store that the application does not currently need.

### Uploads

The frontend requests a presigned upload URL from the backend and uploads the file directly to MinIO.

The frontend never handles MinIO credentials or constructs storage URLs itself.

The flow is:

**Frontend → Backend → presigned URL → MinIO**

followed by an upload-completion request to the backend.

### Cache updates

After mutations such as creating, moving, renaming, or deleting files/folders, the relevant server queries are refreshed so the UI reflects the latest backend state.

---

## What I'd Do Differently

With more time, I would add:

- Upload progress indicators
- Better drag-and-drop interactions
- More comprehensive loading/error states
- Optimistic updates for simple mutations
- More extensive component and E2E tests
- Improved accessibility testing
- Better responsive/mobile behaviour
- More polished thumbnail previews
- Better handling of interrupted uploads

---

## What We Cut

**Global state management** — unnecessary for the current application size.

**Complex design system** — the UI does not require a custom component framework.

**Advanced file previewing** — kept the focus on core file-management functionality.

**Offline support** — not required for this type of application.

**Advanced drag-and-drop file management** — useful but outside the core requirements.

**Extensive animations** — prioritised usability and implementation speed over visual effects.

The frontend was intentionally kept simple so most complexity remains where it belongs: in the backend's file, authorization, and storage workflows.
