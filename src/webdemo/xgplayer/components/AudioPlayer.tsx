import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { formatTime } from '../lib/utils'

export interface AudioPlayerHandle {
  seek: (t: number) => void
  play: () => void
}

interface AudioPlayerProps {
  url: string
  name: string
  onTimeUpdate: (t: number) => void
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  ({ url, name, onTimeUpdate }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [playing, setPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [current, setCurrent] = useState(0)
    const [rate, setRate] = useState(1)

    useImperativeHandle(ref, () => ({
      seek: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t },
      play: () => { audioRef.current?.play() },
    }))

    // #region rAF 高频上报播放进度, 保证逐词高亮流畅
    useEffect(() => {
      let raf = 0
      const loop = () => {
        const a = audioRef.current
        if (a) {
          setCurrent(a.currentTime)
          onTimeUpdate(a.currentTime)
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(raf)
    }, [onTimeUpdate])
    // #endregion

    // #region 播放控制
    const togglePlay = () => {
      const a = audioRef.current
      if (!a) return
      if (a.paused) a.play()
      else a.pause()
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const a = audioRef.current
      if (!a || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      a.currentTime = ratio * duration
    }

    const cycleRate = () => {
      const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
      setRate(next)
      if (audioRef.current) audioRef.current.playbackRate = next
    }
    // #endregion

    const progress = duration ? (current / duration) * 100 : 0

    return (
      <div style={styles.bar}>
        <audio
          ref={audioRef}
          src={url}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {/* 顶部进度条 */}
        <div style={styles.progressTrack} onClick={handleSeek}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          <div style={{ ...styles.progressThumb, left: `${progress}%` }} />
        </div>
        {/* 控制行 */}
        <div style={styles.controls}>
          <button style={styles.playBtn} onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <span style={styles.time}>
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <span style={styles.name} title={name}>🎵 {name}</span>
          <button style={styles.rateBtn} onClick={cycleRate}>{rate}x</button>
        </div>
      </div>
    )
  }
)

AudioPlayer.displayName = 'AudioPlayer'
export default AudioPlayer

// #region 样式
const styles: Record<string, React.CSSProperties> = {
  bar: {
    flexShrink: 0,
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
    padding: '0 0 10px',
  },
  progressTrack: {
    position: 'relative',
    height: 6,
    background: '#e8e8e8',
    cursor: 'pointer',
    marginBottom: 12,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: '#1890ff',
  },
  progressThumb: {
    position: 'absolute',
    top: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: '50%',
    background: '#1890ff',
    transform: 'translateY(-50%)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '0 16px',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: '#1890ff',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
  },
  time: { fontSize: 13, color: '#666', fontFamily: 'monospace', flexShrink: 0 },
  name: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rateBtn: {
    minWidth: 44,
    height: 28,
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    flexShrink: 0,
  },
}
// #endregion
