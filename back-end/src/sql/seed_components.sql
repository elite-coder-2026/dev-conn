-- Seed basic UI components
-- Run: psql $DATABASE_URL -f src/sql/seed_components.sql

INSERT INTO users (id, name, handle, password_hash, cover_color)
VALUES (
  'ffffffff-0000-0000-0000-000000000001',
  'DevConn',
  'devconn',
  'not-a-valid-hash-not-loginable',
  'linear-gradient(135deg, #5B4FE9 0%, #7B72ED 100%)'
) ON CONFLICT DO NOTHING;

INSERT INTO posts (author_id, content) VALUES

('ffffffff-0000-0000-0000-000000000001', $$Component: GradientButton
Version: 1.0.0
Author: DevConn (@devconn)
License: MIT

Pill-shaped button with purple gradient and smooth hover transition.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>* { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
body { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; }
.btn { padding: 12px 32px; font-size: 15px; font-weight: 600; color: #fff; border: none; border-radius: 9999px; background: #5B4FE9; cursor: pointer; transition: background 150ms ease; }
.btn:hover { background: #4A3FD6; }</style>
</head>
<body>
<button class="btn">Click me</button>
<script>document.querySelector('.btn').addEventListener('click',()=>alert('Clicked!'))</script>
</body>
</html>
```$$),

('ffffffff-0000-0000-0000-000000000001', $$Component: ContentCard
Version: 1.0.0
Author: DevConn (@devconn)
License: MIT

Clean card with title, body copy, and a call-to-action button.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>* { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
body { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; }
.card { background: #fff; border-radius: 12px; padding: 24px; width: 300px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.card__title { font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.card__body { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
.card__btn { display: block; width: 100%; padding: 10px; text-align: center; background: #5B4FE9; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.card__btn:hover { background: #4A3FD6; }</style>
</head>
<body>
<div class="card">
  <div class="card__title">Card Title</div>
  <p class="card__body">A simple, reusable card component with a title, body text, and a call-to-action button.</p>
  <button class="card__btn">Learn More</button>
</div>
<script></script>
</body>
</html>
```$$),

('ffffffff-0000-0000-0000-000000000001', $$Component: StatusBadge
Version: 1.0.0
Author: DevConn (@devconn)
License: MIT

Coloured status badges for success, warning, error, and info states.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>* { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
body { display: flex; align-items: center; justify-content: center; gap: 8px; height: 100vh; background: #f0f2f5; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
.badge--success { background: #d1fae5; color: #065f46; }
.badge--warning { background: #fef3c7; color: #92400e; }
.badge--error   { background: #fee2e2; color: #991b1b; }
.badge--info    { background: #dbeafe; color: #1e40af; }</style>
</head>
<body>
<span class="badge badge--success">● Active</span>
<span class="badge badge--warning">● Pending</span>
<span class="badge badge--error">● Offline</span>
<span class="badge badge--info">● Beta</span>
<script></script>
</body>
</html>
```$$),

('ffffffff-0000-0000-0000-000000000001', $$Component: AlertBox
Version: 1.0.0
Author: DevConn (@devconn)
License: MIT

Dismissible alert box with success, error, and info variants.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>* { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; height: 100vh; background: #f0f2f5; padding: 16px; }
.alert { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; width: 100%; max-width: 400px; padding: 14px 16px; border-radius: 8px; font-size: 14px; }
.alert--success { background: #d1fae5; color: #065f46; }
.alert--error   { background: #fee2e2; color: #991b1b; }
.alert--info    { background: #dbeafe; color: #1e40af; }
.alert__close { cursor: pointer; background: none; border: none; font-size: 16px; color: inherit; opacity: .6; }
.alert__close:hover { opacity: 1; }</style>
</head>
<body>
<div class="alert alert--success"><span>Changes saved.</span><button class="alert__close" onclick="this.parentElement.remove()">x</button></div>
<div class="alert alert--error"><span>Something went wrong.</span><button class="alert__close" onclick="this.parentElement.remove()">x</button></div>
<div class="alert alert--info"><span>New version available.</span><button class="alert__close" onclick="this.parentElement.remove()">x</button></div>
<script></script>
</body>
</html>
```$$);
