import React, { useRef, useState } from 'react'

const SAMPLE_VIDEOS = [
  { title: 'Big Buck Bunny', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { title: 'Elephant Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
]

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const switchVideo = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>🎬 Video Player</h1>
      <video
        ref={videoRef}
        src={SAMPLE_VIDEOS[currentIndex].url}
        style={{ width: '100%', borderRadius: 8, background: '#000' }}
        onEnded={() => setIsPlaying(false)}
        controls
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={togglePlay} style={{ padding: '8px 16px', fontSize: 14 }}>
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
      </div>
      <h3 style={{ marginTop: 20 }}>播放列表</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {SAMPLE_VIDEOS.map((video, i) => (
          <li
            key={video.url}
            onClick={() => switchVideo(i)}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              borderRadius: 4,
              background: i === currentIndex ? '#e3f2fd' : 'transparent',
              fontWeight: i === currentIndex ? 'bold' : 'normal',
            }}
          >
            {video.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
