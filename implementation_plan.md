# Implementation Plan - Campus Talks (WhisperCampus Clone)

## Objective
Build a full-stack anonymous social platform inspired by "WhisperCampus" where users can share stories, confessions, and rants.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for animations), Lucide React (icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **State Management**: React Context or lightweight storage.

## Architecture
- **Monorepo Style**:
  - `/client`: Frontend application.
  - `/server`: Backend API.

## Features & Roadmap

### Phase 1: Setup & Foundation
- [ ] Initialize project structure (client/server).
- [ ] Setup Tailwind CSS with custom theme (Dark mode, Gradients).
- [ ] Create basic Express server setup.
- [ ] Connect to MongoDB.

### Phase 2: Frontend UI Implementation (Aesthetics focus)
- [ ] **Header**: Logo, Create Post button, User profile status.
- [ ] **Hero Section**: "What's on your mind?" with gradient background.
- [ ] **Filter Bar**: Scrollable/Wrap categories (Crush, Rant, Confession, etc.).
- [ ] **Feed**: Post cards with:
    - Tag styling (Crush = pink, Rant = orange, etc.)
    - Content typography.
    - Interaction bar (Upvotes, Downvotes, Comments).

### Phase 3: Backend API
- [ ] **Models**: `Post` (content, category, upvotes, downvotes, timestamp).
- [ ] **Routes**: 
    - `GET /api/posts`: Fetch all posts (with filtering).
    - `POST /api/posts`: Create a new confession.
    - `PATCH /api/posts/:id/vote`: Handle up/down votes.

### Phase 4: Integration
- [ ] Connect Frontend to Backend.
- [ ] Implement "Create Post" modal/page.
- [ ] Real-time updates (optimistic UI updates for voting).

## UI Design Specs (from Image)
- **Primary Color**: Blurple/Violet gradients.
- **Background**: Deep dark blue/slate (`bg-slate-900` or similar).
- **Cards**: Slightly lighter dark glassmorphism or solid slate.
- **Typography**: Clean sans-serif (Inter/Outfit).
