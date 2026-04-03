import PostCard from '../PostCard/PostCard'
import './PostFeed.css'

export default function PostFeed({ posts }) {
  return (
    <div className="post-feed">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
