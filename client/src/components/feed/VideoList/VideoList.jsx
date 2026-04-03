import './VideoList.css'

export default function VideoList({ videos }) {
  return (
    <div className="video-list">
      <h2 className="video-list__heading">Videos</h2>
      <div className="video-list__grid">
        {videos.map(video => (
          <div key={video.id} className="video-list__card">
            <div className="video-list__video-wrap">
              <iframe
                className="video-list__video"
                src={video.videoUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="video-list__info">
              <p className="video-list__title">{video.title}</p>
              <p className="video-list__description">{video.description}</p>
              <p className="video-list__meta">{video.views.toLocaleString()} views · {video.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
