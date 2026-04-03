const mockPosts = [
  {
    id: 'p1',
    type: 'text',
    author: {
      name: 'Jordan Kim',
      handle: '@jordankim',
      avatarSrc: 'https://i.pravatar.cc/150?u=p1',
    },
    timeAgo: '2m ago',
    content:
      'Just shipped a brand new design system at work — 47 components, full dark mode, and zero legacy CSS. Feels incredible to finally close that tech debt. 🚀',
    likes: 84,
    comments: 12,
    shares: 6,
  },
  {
    id: 'p2',
    type: 'text',
    author: {
      name: 'Priya Nair',
      handle: '@priyanair',
      avatarSrc: 'https://i.pravatar.cc/150?u=p2',
    },
    timeAgo: '18m ago',
    content:
      'Hot take: the best debugging tool is still `console.log`. Fight me. 😄\n\nSometimes you just need to know the exact value at the exact moment, not 30 layers of stack trace.',
    likes: 231,
    comments: 57,
    shares: 29,
  },
  {
    id: 'p6',
    type: 'image',
    author: {
      name: 'Lena Hoffmann',
      handle: '@lenahoffmann',
      avatarSrc: 'https://i.pravatar.cc/150?u=p6',
    },
    timeAgo: '45m ago',
    content: 'New desk setup is finally done. This is where the magic happens ✨',
    imageUrl: 'https://picsum.photos/seed/desk/700/420',
    likes: 418,
    comments: 43,
    shares: 17,
  },
  {
    id: 'p7',
    type: 'video',
    author: {
      name: 'Marcus Webb',
      handle: '@marcuswebb',
      avatarSrc: 'https://i.pravatar.cc/150?u=p3',
    },
    timeAgo: '1h ago',
    content: 'Best explanation of React Server Components I\'ve seen — worth every minute.',
    videoUrl: 'https://www.youtube.com/embed/AJOGzVygGcY',
    likes: 89,
    comments: 31,
    shares: 14,
  },
  {
    id: 'p8',
    type: 'link',
    author: {
      name: 'Ryan Patel',
      handle: '@ryanpatel',
      avatarSrc: 'https://i.pravatar.cc/150?u=p5',
    },
    timeAgo: '3h ago',
    content: 'This changed how I think about state management in React.',
    link: {
      url: 'https://react.dev',
      title: 'React – The library for web and native user interfaces',
      description: 'React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video.',
      image: 'https://react.dev/images/og-home.png',
      domain: 'react.dev',
    },
    likes: 156,
    comments: 22,
    shares: 41,
  },
  {
    id: 'p9',
    type: 'component',
    author: {
      name: 'Sasha Okonkwo',
      handle: '@sashaokonkwo',
      avatarSrc: 'https://i.pravatar.cc/150?u=p4',
    },
    timeAgo: '5h ago',
    content: 'Built this animated gradient button — feel free to steal it 🎨',
    code: `<style>
  * { margin: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
  body { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; }
  .btn {
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    border: none;
    border-radius: 9999px;
    background: linear-gradient(135deg, #5B4FE9, #E94FA8);
    background-size: 200% 200%;
    cursor: pointer;
    animation: gradient-shift 3s ease infinite;
    box-shadow: 0 4px 20px rgba(91,79,233,0.4);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(91,79,233,0.5); }
  .btn:active { transform: translateY(0); }
  @keyframes gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
<button class="btn">Get Started</button>`,
    likes: 312,
    comments: 67,
    shares: 98,
  },
  {
    id: 'p3',
    type: 'text',
    author: {
      name: 'Marcus Webb',
      handle: '@marcuswebb',
      avatarSrc: 'https://i.pravatar.cc/150?u=p3',
    },
    timeAgo: '6h ago',
    content:
      'Working on an open-source CLI tool for generating project scaffolds. Would love beta testers — link in comments if interested!',
    likes: 47,
    comments: 23,
    shares: 11,
  },
]

export default mockPosts
