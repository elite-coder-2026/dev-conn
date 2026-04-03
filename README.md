# devconn

A developer-focused social platform for sharing posts, components, videos, and links — built with React, Node.js, Express, and PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Frontend](#frontend)
  - [Pages & Navigation](#pages--navigation)
  - [Component Architecture](#component-architecture)
  - [Design System](#design-system)
  - [Post Types](#post-types)
- [Backend](#backend)
  - [API Reference](#api-reference)
  - [Database Schema](#database-schema)
  - [Architecture](#architecture)
- [Real-Time](#real-time)

---

## Overview

devconn is a social network built for developers. Users can publish posts in multiple formats (text, image, video, link, or live component previews), react to content, comment and reply, share posts, and connect with other developers. The platform includes a feed, messaging, friend connections, content discovery, and a GitHub-style activity heatmap on each profile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Material UI Icons |
| Styling | Plain CSS with custom properties (no CSS-in-JS) |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL 13+ |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io |
| Dev tooling | nodemon, ESLint |

---

## Project Structure

```
dev-conn/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # ChatTray, ChatWindow
│   │   │   ├── common/         # Avatar, IconButton, NotificationsDropdown
│   │   │   ├── discover/       # DiscoverPage
│   │   │   ├── feed/           # Feed, PostCard, PostComposer, Profile, etc.
│   │   │   ├── friends/        # FriendsPage
│   │   │   ├── layout/         # AppHeader
│   │   │   ├── messages/       # MessagesPage
│   │   │   └── video/          # VideoPlayerPage
│   │   ├── data/               # Mock data (posts, users, contacts, videos)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Design tokens & global reset
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── back-end/                   # Node/Express API
    ├── src/
    │   ├── controllers/        # Request handlers
    │   ├── middleware/         # auth, errorHandler
    │   ├── routes/             # Express routers
    │   ├── services/           # Business logic
    │   │   └── queries/        # SQL query modules (one file per domain)
    │   ├── sql/                # schema.sql, seed.js
    │   ├── utils/              # formatUser, timeAgo
    │   ├── db.js               # pg Pool
    │   ├── socket.js           # Socket.io setup
    │   └── index.js            # App entry point
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+

### 1. Clone the repo

```bash
git clone <repo-url>
cd dev-conn
```

### 2. Backend setup

```bash
cd back-end
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)), then initialise the database:

```bash
npm run db:schema    # creates all tables
npm run db:seed      # seeds initial data
```

Start the API server:

```bash
npm run dev          # development (nodemon)
npm start            # production
```

The API runs on `http://localhost:3001` by default.

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. CORS is pre-configured for this origin.

---

## Environment Variables

Create `back-end/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devconn
JWT_SECRET=your_jwt_secret_here
CLIENT_ORIGIN=http://localhost:5173
PORT=3001
```

---

## Frontend

### Pages & Navigation

Navigation is managed in `App.jsx` via a single `activeNav` string. There is no client-side router — pages are conditionally rendered based on the active nav state.

| Nav ID | Component | Description |
|---|---|---|
| `feed` | `FeedPage` | Main post feed with composer and sidebars |
| `messages` | `MessagesPage` | Inbox and conversation threads |
| `friends` | `FriendsPage` | Friend requests, connections, suggestions |
| `discover` | `DiscoverPage` | Browse and connect with other developers |
| `videos` | `VideoPlayerPage` | Video content feed |
| `profile` | `ProfilePage` | User profile with activity heatmap |

### Component Architecture

Each component lives in its own directory with a colocated CSS file:

```
ComponentName/
  ComponentName.jsx
  ComponentName.css
```

Components are pure — they receive props and call handler callbacks. State is managed in the nearest page-level parent.

**Common components** (`src/components/common/`) are shared across pages:

| Component | Props | Description |
|---|---|---|
| `Avatar` | `src`, `alt`, `size`, `online` | User avatar with initials fallback and online dot |
| `IconButton` | `icon`, `label`, `badge`, `onClick`, `active` | Circular icon button with optional badge count |
| `NotificationsDropdown` | `notifications`, `onClose`, `onMarkAllRead` | Notification panel with type icons and unread state |

**Feed-specific components** (`src/components/feed/`):

| Component | Description |
|---|---|
| `PostCard` | Renders a single post with media, actions, and reaction support |
| `PostComposer` | Expandable composer with tabs for each post type |
| `PostFeed` | Maps a posts array to PostCard instances |
| `ShareModal` | Centered modal with backdrop for sharing a post with a description |
| `ReactionPicker` | Animated hover picker with 5 reaction types |
| `CommentSection` | Comment list with inline reply threads |
| `ActivityGraph` | GitHub-style contribution heatmap |
| `ContactSidebar` | Online/offline contact list |
| `LeftSidebar` | Profile card and navigation shortcuts |

### Design System

All design tokens are CSS custom properties defined in `src/index.css`. No values are hardcoded in component stylesheets.

**Colors**
```css
--color-accent: #5B4FE9          /* primary purple */
--color-surface: #FFFFFF
--color-bg: #F0F2F5
--color-text-primary: #1C1E21
--color-text-secondary: #606770
--color-text-muted: #8A8D91
--color-border: #E4E6EB
```

**Spacing** — 4px base unit
```css
--space-1: 4px   --space-2: 8px   --space-3: 12px
--space-4: 16px  --space-6: 24px  --space-8: 32px
```

**Typography**
```css
--font-size-xs: 11px   --font-size-sm: 13px
--font-size-base: 15px --font-size-lg: 20px
```

**Other**
```css
--radius-sm: 6px  --radius-md: 12px  --radius-full: 9999px
--transition-fast: 150ms ease
--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
```

CSS class naming follows BEM: `.post-card__header`, `.post-card__action-btn--active`.

### Post Types

The `PostComposer` supports five post types, each rendered by `PostCard` via the `PostMedia` sub-component:

| Type | Composer input | Rendered as |
|---|---|---|
| `text` | Textarea | Plain text content |
| `image` | Image URL | Full-width `<img>` |
| `video` | YouTube URL | Embedded `<iframe>` (16:9) |
| `link` | URL + optional title | Link preview card with domain, title, description |
| `component` | HTML/CSS/JS editor | Sandboxed `<iframe srcDoc>` with live preview |

---

## Backend

### API Reference

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

#### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | No | Create a new account |
| `POST` | `/login` | No | Sign in, receive JWT |
| `PUT` | `/password` | Yes | Change password |
| `DELETE` | `/account` | Yes | Delete account |

#### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/me` | Yes | Get current user profile |
| `PUT` | `/me` | Yes | Update name, avatar, cover |
| `DELETE` | `/me` | Yes | Delete current user |
| `GET` | `/search?q=` | Yes | Search users by name or handle |
| `GET` | `/:id` | No | Get a user by ID |

#### Feed — `/api/feed`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Yes | Get paginated feed posts |

#### Posts — `/api/posts`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Yes | Create a post |
| `GET` | `/:id` | Yes | Get a single post |
| `PUT` | `/:id` | Yes | Update a post (author only) |
| `DELETE` | `/:id` | Yes | Delete a post (author only) |
| `POST` | `/:id/like` | Yes | Like a post |
| `DELETE` | `/:id/like` | Yes | Unlike a post |
| `POST` | `/:id/share` | Yes | Share a post |
| `DELETE` | `/:id/share` | Yes | Unshare a post |
| `GET` | `/:id/comments` | Yes | Get comments on a post |
| `POST` | `/:id/comments` | Yes | Add a comment |
| `PUT` | `/:id/comments/:cid` | Yes | Edit a comment (author only) |
| `DELETE` | `/:id/comments/:cid` | Yes | Delete a comment (author only) |

#### Connections — `/api/connections`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/friends` | Yes | List accepted friends |
| `GET` | `/requests/incoming` | Yes | Pending requests received |
| `GET` | `/requests/outgoing` | Yes | Pending requests sent |
| `POST` | `/requests` | Yes | Send a friend request |
| `DELETE` | `/requests/:id` | Yes | Cancel a sent request |
| `POST` | `/requests/:id/accept` | Yes | Accept a request |
| `POST` | `/requests/:id/decline` | Yes | Decline a request |
| `DELETE` | `/friends/:id` | Yes | Unfriend |
| `GET` | `/discover` | Yes | Browse users not yet connected |
| `GET` | `/suggestions` | Yes | Friend suggestions by mutual count |

#### Contacts — `/api/contacts`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/following` | Yes | Users the current user follows |
| `GET` | `/followers` | Yes | Users following the current user |
| `POST` | `/follow/:id` | Yes | Follow a user |
| `DELETE` | `/follow/:id` | Yes | Unfollow a user |

#### Direct Messages — `/api/dm`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/inbox` | Yes | List all conversations |
| `POST` | `/conversations` | Yes | Start or retrieve a conversation |
| `GET` | `/conversations/:id/messages` | Yes | Get messages (paginated) |
| `POST` | `/conversations/:id/messages` | Yes | Send a message |
| `DELETE` | `/messages/:id` | Yes | Soft-delete a message |

#### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/?userId=` | No | Get notifications for a user |
| `PATCH` | `/read-all?userId=` | No | Mark all notifications as read |

---

### Database Schema

The schema is defined in `back-end/src/sql/schema.sql` and requires PostgreSQL 13+.

```
users
  id · name · handle · avatar_url · cover_color · password_hash · is_online · created_at

posts
  id · author_id → users · content · image_url · created_at

follows
  follower_id → users · following_id → users · created_at

likes
  user_id → users · post_id → posts · created_at

comments
  id · post_id → posts · author_id → users · content · created_at

shares
  user_id → users · post_id → posts · created_at

friend_requests
  id · requester_id → users · recipient_id → users · status · created_at

notifications
  id · user_id → users · actor_id → users · type · message · read · created_at

conversations
  id · created_at · updated_at

conversation_participants
  conversation_id → conversations · user_id → users · last_read_at

messages
  id · conversation_id → conversations · sender_id → users · body · created_at · deleted_at

message_receipts
  message_id → messages · user_id → users · read_at
```

Run migrations:

```bash
npm run db:schema
```

---

### Architecture

The backend follows a strict three-layer pattern:

```
Route → Controller → Service → Database
```

**Routes** (`src/routes/`) — define HTTP method and path, apply middleware, delegate to a controller function. No logic.

**Controllers** (`src/controllers/`) — validate the request, call one service function, return the response. Error objects carry a `.status` property for the error handler to use.

**Services** (`src/services/`) — all business logic and database access. Each service imports its query strings from `src/services/queries/` and executes them via the shared `pg` pool.

**Queries** (`src/services/queries/`) — SQL is separated from logic, one file per domain:

```
queries/
  auth.js · contact.js · post.js · user.js
  feed.js · connection.js · dm.js · notification.js
```

A barrel file (`queries.js`) re-exports all of them so existing `require('./queries')` imports are unaffected.

**Middleware**
- `auth.js` — verifies the JWT, attaches `req.user = { id, handle }` to the request
- `errorHandler.js` — central error handler; maps PostgreSQL error codes and `err.status` to HTTP responses

**Utilities** (`src/utils/`)
- `formatUser.js` — normalises a user row (prefixes `@` to handle)
- `timeAgo.js` — converts a timestamp to a human-readable relative string (`2m ago`, `1h ago`, etc.)

---

## Real-Time

Socket.io is initialised in `src/socket.js` and attached to the HTTP server in `src/index.js`. It is available for real-time features such as live messaging, presence, and notification delivery.
