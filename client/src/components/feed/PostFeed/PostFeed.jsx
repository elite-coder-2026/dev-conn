import PostCard from '../PostCard/PostCard'
import './PostFeed.css'

export default function PostFeed({ posts, onDelete, currentUser }) {
  return (
    <div className="post-feed">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onDelete={onDelete} currentUser={currentUser} />
      ))}
    </div>
  )
}
