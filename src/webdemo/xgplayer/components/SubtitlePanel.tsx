import React, { useEffect, useRef } from 'react'
import type { SubtitleCue } from '../lib/types'
import { formatTime } from '../lib/utils'

interface SubtitlePanelProps {
  subtitles: SubtitleCue[]
  activeCueIndex: number
  onCueClick: (cue: SubtitleCue) => void
}

export default function SubtitlePanel({ subtitles, activeCueIndex, onCueClick }: SubtitlePanelProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // 自动滚动到当前字幕
  useEffect(() => {
    if (activeCueIndex < 0 || !listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-idx="${activeCueIndex}"]`)
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeCueIndex])

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>字幕列表</span>
        <span style={styles.cueCount}>{subtitles.length} 条</span>
      </div>
      <div ref={listRef} style={styles.list}>
        {subtitles.length === 0 ? (
          <div style={styles.placeholder}>
            <p>暂无字幕</p>
            <p style={{ fontSize: 13, color: '#999' }}>同分组的 .vtt 文件会自动加载</p>
          </div>
        ) : (
          subtitles.map((cue, idx) => (
            <div
              key={cue.id}
              data-idx={idx}
              style={{ ...styles.cueItem, ...(idx === activeCueIndex ? styles.cueItemActive : {}) }}
              onClick={() => onCueClick(cue)}
            >
              <span style={styles.cueTime}>{formatTime(cue.startTime)}</span>
              <span style={styles.cueText}>{cue.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// #region 样式
const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 320,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderLeft: '1px solid #e8e8e8',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    borderBottom: '1px solid #f0f0f0',
    flexShrink: 0,
  },
  cueCount: { fontSize: 12, color: '#999', fontWeight: 400 },
  list: { flex: 1, overflowY: 'auto' as const, padding: '6px 0' },
  placeholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontSize: 14,
  },
  cueItem: {
    display: 'flex', gap: 10,
    padding: '8px 14px', cursor: 'pointer',
    transition: 'background 0.15s',
    borderLeft: '3px solid transparent',
    alignItems: 'flex-start',
  },
  cueItemActive: { background: '#e6f7ff', borderLeftColor: '#1890ff' },
  cueTime: {
    fontSize: 12, color: '#1890ff', fontFamily: 'monospace',
    whiteSpace: 'nowrap' as const, paddingTop: 2, flexShrink: 0,
  },
  cueText: { fontSize: 14, color: '#333', lineHeight: '1.5', wordBreak: 'break-word' as const },
}
// #endregion
