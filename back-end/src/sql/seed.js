'use strict'
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const bcrypt = require('bcryptjs')
const pool   = require('../db')

async function seed() {
  const hash = bcrypt.hashSync('password123', 12)

  const users = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Alex Rivera',     handle: 'alexrivera',    avatar_url: 'https://i.pravatar.cc/150?u=u0',  cover_color: 'linear-gradient(135deg, #5B4FE9 0%, #7B72ED 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Jordan Kim',      handle: 'jordankim',     avatar_url: 'https://i.pravatar.cc/150?u=c1',  cover_color: 'linear-gradient(135deg, #43B89C 0%, #2D8E72 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Priya Nair',      handle: 'priyanair',     avatar_url: 'https://i.pravatar.cc/150?u=c2',  cover_color: 'linear-gradient(135deg, #E96B4F 0%, #D44A2D 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Marcus Webb',     handle: 'marcuswebb',    avatar_url: 'https://i.pravatar.cc/150?u=c3',  cover_color: 'linear-gradient(135deg, #4F9DE9 0%, #2D7DD4 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Lena Hoffmann',   handle: 'lenahoffmann',  avatar_url: 'https://i.pravatar.cc/150?u=c4',  cover_color: 'linear-gradient(135deg, #9B59B6 0%, #7D3C98 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000006', name: 'Ryan Patel',      handle: 'ryanpatel',     avatar_url: 'https://i.pravatar.cc/150?u=c5',  cover_color: 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)', is_online: true  },
    { id: '00000000-0000-0000-0000-000000000007', name: 'Sasha Okonkwo',   handle: 'sashaokonkwo',  avatar_url: 'https://i.pravatar.cc/150?u=c6',  cover_color: 'linear-gradient(135deg, #1ABC9C 0%, #17A589 100%)', is_online: false },
    { id: '00000000-0000-0000-0000-000000000008', name: 'Tomás Ferreira',  handle: 'tomasferreira', avatar_url: 'https://i.pravatar.cc/150?u=c7',  cover_color: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)', is_online: false },
    { id: '00000000-0000-0000-0000-000000000009', name: 'Yuki Tanaka',     handle: 'yukitanaka',    avatar_url: 'https://i.pravatar.cc/150?u=c8',  cover_color: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)', is_online: false },
    { id: '00000000-0000-0000-0000-000000000010', name: 'Claire Dubois',   handle: 'clairedubois',  avatar_url: 'https://i.pravatar.cc/150?u=c9',  cover_color: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)', is_online: false },
    { id: '00000000-0000-0000-0000-000000000011', name: 'Dev Singh',       handle: 'devsingh',      avatar_url: 'https://i.pravatar.cc/150?u=c10', cover_color: 'linear-gradient(135deg, #E67E22 0%, #CA6F1E 100%)', is_online: false },
  ]

  console.log('Seeding users...')
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, name, handle, avatar_url, cover_color, password_hash, is_online)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name, u.handle, u.avatar_url, u.cover_color, hash, u.is_online]
    )
  }

  // Alex Rivera follows all other users
  const alexId = '00000000-0000-0000-0000-000000000001'
  console.log('Seeding follows...')
  for (let i = 2; i <= 11; i++) {
    const followingId = `00000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`
    await pool.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [alexId, followingId]
    )
  }

  console.log('Seeding posts...')
  const posts = [
    {
      id:        '10000000-0000-0000-0000-000000000001',
      author_id: '00000000-0000-0000-0000-000000000002',
      content:   'Just shipped a brand new design system at work — 47 components, full dark mode, and zero legacy CSS. Feels incredible to finally close that tech debt. 🚀',
      interval:  '2 minutes',
    },
    {
      id:        '10000000-0000-0000-0000-000000000002',
      author_id: '00000000-0000-0000-0000-000000000003',
      content:   'Hot take: the best debugging tool is still `console.log`. Fight me. 😄\n\nSometimes you just need to know the exact value at the exact moment, not 30 layers of stack trace.',
      interval:  '18 minutes',
    },
    {
      id:        '10000000-0000-0000-0000-000000000003',
      author_id: '00000000-0000-0000-0000-000000000004',
      content:   'Working on an open-source CLI tool for generating project scaffolds. Would love beta testers — link in comments if interested!',
      interval:  '1 hour',
    },
    {
      id:        '10000000-0000-0000-0000-000000000004',
      author_id: '00000000-0000-0000-0000-000000000007',
      content:   "Quick reminder that code reviews are not just about catching bugs — they're about sharing context, mentoring, and building team trust. Be kind in your reviews today. 💙",
      interval:  '3 hours',
    },
    {
      id:        '10000000-0000-0000-0000-000000000005',
      author_id: '00000000-0000-0000-0000-000000000008',
      content:   'Finally got my home lab Kubernetes cluster running stable after 3 weekends of pain. The trick was… read the docs first. Who knew. 😅',
      interval:  '5 hours',
    },
  ]

  for (const p of posts) {
    await pool.query(
      `INSERT INTO posts (id, author_id, content, created_at)
       VALUES ($1,$2,$3, NOW() - INTERVAL '${p.interval}')
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.author_id, p.content]
    )
  }

  console.log('✓ Seed complete — 11 users, 10 follows, 5 posts')
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
