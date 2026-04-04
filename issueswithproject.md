# Project Issues & Fixes

## 1. `reconnection_queries` instead of `req` — entire backend broken
**Files:** All controllers, auth middleware, error handler
**Issue:** Every single controller and middleware used `reconnection_queries` instead of `req`. No API endpoint in the entire app worked.
**Fix:** Replaced `reconnection_queries` with `req` across all 8 affected files: `auth.js`, `errorHandler.js`, `authController.js`, `feedController.js`, `postController.js`, `userController.js`, `contactController.js`, `connectionController.js`, `directMessageController.js`.

---

## 2. ShareModal existed but was never wired into PostCard
**File:** `PostCard.jsx`
**Issue:** The share button was a dead button. `ShareModal` was built but never imported or used.
**Fix:** Imported `ShareModal`, added `shareOpen` state, wired the share button to open the modal.

---

## 3. CommentSection existed but was never wired into PostCard
**File:** `PostCard.jsx`
**Issue:** The comment button did nothing. `CommentSection` was built but never imported or used.
**Fix:** Imported `CommentSection`, added `commentsOpen` and `commentsList` state, wired the comment button to toggle the section, implemented `handleAddComment` and `handleAddReply`.

---

## 4. Feed was static — used mock data instead of database
**File:** `FeedPage.jsx`
**Issue:** Feed was seeded from `mockPosts.js` with hardcoded data, never fetching from the API.
**Fix:** Added `useEffect` to fetch `GET /api/feed/` on mount, added `normalisePost()` to map snake_case DB rows to the shape PostCard expects. Mock data removed as initial state.

---

## 5. Vite had no proxy config — frontend couldn't reach the backend
**File:** `client/vite.config.js`
**Issue:** Relative `/api` fetch calls went to port 5173 (Vite), not 3001 (Express). Every API call failed with a network error.
**Fix:** Added `server.proxy` in `vite.config.js` to forward `/api` to `http://localhost:3001`.

---

## 6. AppHeader sent `mockUser.id` (`'u0'`) to the notifications endpoint
**File:** `AppHeader.jsx`
**Issue:** `'u0'` is not a valid UUID. PostgreSQL threw an error on every page load, crashing the server log and breaking notifications.
**Fix:** Switched to reading the real user from `localStorage` (later replaced with cookie-based auth and props).

---

## 7. Two server processes running simultaneously — port conflict
**Issue:** A background server process started by Claude held port 3001 while the user's nodemon instance also tried to bind to it. Nodemon crashed every time it restarted.
**Fix:** Killed the background process, left nodemon as the sole process managing the server.

---

## 8. PostComposer never saved posts to the database
**File:** `PostComposer.jsx`
**Issue:** `handleSubmit` built a fake local post object with a counter ID and called `onPost()` directly — nothing was ever sent to the API.
**Fix:** Replaced with an async `fetch('POST /api/posts/')` call. On success, the server response is normalised and passed to `onPost()`.

---

## 9. FeedPage passed `mockUser` to PostComposer instead of the real logged-in user
**File:** `FeedPage.jsx`
**Issue:** Posts were being composed under the mock user identity, not the authenticated user.
**Fix:** Replaced `mockUser` with `currentUser` read from localStorage (later from props via cookie auth).

---

## 10. No login/register UI — no way to get an auth token
**Issue:** The backend required JWT auth on all routes but there was no frontend login or register screen. The entire app was permanently unauthenticated.
**Fix:** Built `AuthPage` component with login/register form that hits `POST /api/auth/login` and `POST /api/auth/register`.

---

## 11. No auth gate in App.jsx
**File:** `App.jsx`
**Issue:** The app rendered the full UI whether or not the user was authenticated.
**Fix:** Added token/user state to `App`. If no session exists, renders `AuthPage`. After login, renders the full app.

---

## 12. Database not created, schema not applied, seed not run
**Issue:** The `devconn` database did not exist. No tables. No users. No posts.
**Fix:** Created the database with `createdb devconn`, fixed `DATABASE_URL` in `.env` (wrong role `postgres` → `darrellparkhouse`), applied schema with `psql`, ran seed script to insert 11 users and 5 posts.

---

## 13. Seeded posts showing for new accounts
**Issue:** Seed data posts appeared in the feed for any logged-in user because `alexrivera` follows all seeded users and the feed query includes followed-user posts.
**Fix:** Ran `TRUNCATE posts CASCADE` to wipe all seeded posts, leaving the database clean for real user-generated content.

---

## 14. PostCard kebab menu only rendered when `isOwner` was true
**File:** `PostCard.jsx`
**Issue:** The three-dot menu silently rendered nothing if the handle comparison failed — no dropdown appeared at all.
**Fix:** Moved the `isOwner` check inside the menu so the dropdown always opens, showing Edit/Delete for own posts only.

---

## 15. `isOwner` handle comparison was always false
**File:** `PostCard.jsx`
**Issue:** `formatUser` on the backend adds `@` to the handle, so `currentUser.handle` was `@alexrivera`. The comparison was `author.handle === \`@${currentUser.handle}\`` which evaluated to `@alexrivera === @@alexrivera`.
**Fix:** Changed comparison to `author.handle === currentUser.handle` since both already include `@`.

---

## 16. JWT stored in localStorage — security vulnerability
**Issue:** Storing JWTs in localStorage exposes them to XSS attacks. Any injected script can read and exfiltrate the token.
**Fix:** Switched to HttpOnly cookies. Backend sets the cookie on login/register via `res.cookie()` with `httpOnly: true`. Auth middleware reads from `req.cookies.token`. Frontend uses `credentials: 'include'` on all fetches. No token ever touches JavaScript.

---

## 17. Notifications route had no auth — used insecure `?userId=` query param
**File:** `notificationController.js`, `routes/notifications.js`
**Issue:** The notifications endpoint read the user ID from a query string parameter, meaning anyone could read anyone's notifications by passing any UUID.
**Fix:** Added `requireAuth` middleware to notification routes. Controller now reads `req.user.id` set by the auth middleware.

---

## 18. `cover_color` NOT NULL constraint violated on register
**File:** `services/queries/user.js`
**Issue:** Register passes `null` for `cover_color` when the user doesn't supply one. The INSERT statement passed `null` as `$4`, hitting the NOT NULL constraint even though the column has a default defined.
**Fix:** Wrapped `$4` in `COALESCE($4, 'linear-gradient(135deg, #5B4FE9 0%, #7B72ED 100%)')` so null falls back to the default gradient.

---

## 19. Component posts stored code in content — raw code visible in feed
**File:** `FeedPage.jsx`, `PostComposer.jsx`
**Issue:** Component posts bundled all metadata and the HTML/CSS/JS code block into the `content` field. PostCard rendered it as plain text, showing raw code instead of the live preview.
**Fix:** `normalisePost()` detects posts starting with `Component:`, extracts the ` ```html ``` ` block via regex into a separate `code` field, and strips it from `content`. PostCard renders `code` as an iframe preview.

---

## 20. PostCard still imported and used `mockUser` for comments
**File:** `PostCard.jsx`
**Issue:** After switching to cookie-based auth, `PostCard` still imported `mockUser` from mock data for comment author attribution.
**Fix:** Removed `mockUser` import. Comment author now uses `currentUser` passed in as a prop from `FeedPage` → `PostFeed` → `PostCard`.
