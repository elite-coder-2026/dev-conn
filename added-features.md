# Added Features

## Core Features

1. **Notifications**
   Bell icon in the header with a dropdown listing unread activity — friend requests, likes, comments, follows, and mentions. Badge count clears on open.

2. **Direct Messages**
   Persist ChatTray conversations to the database. Full message history, read receipts, and a dedicated inbox page listing all active threads.

3. **Real-Time Presence**
   WebSocket connection on login sets `is_online = true` and flips it to `false` on disconnect. Friends sidebar, discover cards, and profile pages reflect live status without polling.

4. **Component Detail Page**
   Dedicated page per component with a README tab, code preview tab, version history, star/fork actions, and a comments section. Accessible from the ComponentList cards on ProfilePage.

5. **Feed Filtering**
   Tabs on the feed: "For You", "Following", "Friends Only", and "Trending". Trending ranks by likes + comments + shares in the last 24 hours.

6. **Search**
   Global search accessible from the header. Returns users, posts, and components. Debounced input, keyboard navigable results, recent searches stored in localStorage.

7. **Post Drafts**
   Auto-save post content to localStorage while typing. Draft indicator in the composer. Restore on page reload. Discard button clears the draft.

8. **Profile Customization**
   Let users update their cover gradient, display name, bio, and avatar from a settings page. The `cover_color` column already exists in the schema.

9. **Bookmarks**
   Save any post to a personal bookmarks list. Accessible from a Bookmarks tab on the profile page. Backend: `bookmarks` table with `user_id` + `post_id`.

10. **Mutual Friends on Profile**
    When viewing another user's profile, show a "X mutual friends" count and a preview of shared connections, similar to the discover and suggestions cards.

---

## Bonus Features

11. **Component Version Control**
    Allow users to push new versions of a component with a changelog entry. Each version is stored and diffable. Inspired by npm versioning.

12. **Spaces / Rooms**
    Persistent group chat rooms organized by topic or technology (e.g. #react, #typescript). Members can post messages, share code snippets, and pin resources.

13. **GitHub Integration**
    OAuth connect with GitHub to auto-import repos as components, display contribution graphs alongside the ActivityGraph heatmap, and show a verified GitHub badge on the profile.
