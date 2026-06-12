import React, { useEffect, useRef } from 'react'
import type { SubtitleCue } from '../lib/types'
import { formatTime, speakerColor } from '../lib/utils'

interface SubtitlePanelProps {
  subtitles: SubtitleCue[]
  activeCueIndex: number
  currentTime: number
  fullWidth?: boolean
  onCueClick: (cue: SubtitleCue) => void
}

export default function SubtitlePanel({
  subtitles, activeCueIndex, currentTime, fullWidth, onCueClick,
}: SubtitlePanelProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // 自动滚动到当前字幕
  useEffect(() => {
    if (activeCueIndex < 0 || !listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-idx="${activeCueIndex}"]`)
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeCueIndex])

  const panelStyle = fullWidth
    ? { ...styles.panel, ...styles.panelFull }
    : styles.panel

  return (
    <div style={panelStyle}>
      <div style={styles.header}>
        <span>逐字稿</span>
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
            <CueRow
              key={cue.id}
              cue={cue}
              idx={idx}
              isActive={idx === activeCueIndex}
              currentTime={currentTime}
              onClick={() => onCueClick(cue)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// #region 单条字幕渲染
interface CueRowProps {
  cue: SubtitleCue
  idx: number
  isActive: boolean
  currentTime: number
  onClick: () => void
}

function CueRow({ cue, idx, isActive, currentTime, onClick }: CueRowProps) {
  const sColor = cue.speaker ? speakerColor(cue.speaker) : '#1890ff'

  return (
    <div
      data-idx={idx}
      style={{
        ...styles.cueItem,
        ...(isActive ? { ...styles.cueItemActive, borderLeftColor: sColor } : {}),
      }}
      onClick={onClick}
    >
      <div style={styles.cueMeta}>
        {cue.speaker && (
          <span style={{ ...styles.speaker, color: sColor }}>{cue.speaker}</span>
        )}
        <span style={styles.cueTime}>{formatTime(cue.startTime)}</span>
      </div>
      <div style={styles.cueText}>
        {/* 仅当前句逐词高亮(卡拉OK), 其余句子静态渲染以保证性能 */}
        {isActive
          ? cue.words.map((w, i) => {
              const read = currentTime >= w.endTime
              const speaking = currentTime >= w.startTime && currentTime < w.endTime
              return (
                <span
                  key={i}
                  style={{
                    color: speaking ? '#fff' : read ? '#1a1a1a' : '#9aa0a6',
                    background: speaking ? sColor : 'transparent',
                    borderRadius: 3,
                    transition: 'color 0.1s',
                  }}
                >
                  {w.text}
                </span>
              )
            })
          : cue.text}
      </div>
    </div>
  )
}
// #endregion

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
  panelFull: {
    width: 'auto',
    flex: 1,
    borderLeft: 'none',
    minWidth: 0,
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
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderLeft: '3px solid transparent',
  },
  cueItemActive: { background: '#f0f8ff' },
  cueMeta: { display: 'flex', alignItems: 'center', gap: 10 },
  speaker: { fontSize: 13, fontWeight: 600 },
  cueTime: {
    fontSize: 12, color: '#999', fontFamily: 'monospace', whiteSpace: 'nowrap' as const,
  },
  cueText: { fontSize: 15, color: '#333', lineHeight: '1.7', wordBreak: 'break-word' as const },
}
// #endregion
