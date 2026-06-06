import React, { useEffect, useRef, useState, useCallback } from 'react'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import type { SubtitleCue, MediaFile, FileGroup } from './lib/types'
import { parseVTT } from './lib/utils'
import { dbGetAll, dbPut } from './lib/db'
import FileTree from './components/FileTree'
import SubtitlePanel from './components/SubtitlePanel'

export default function App() {
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)

  const [videoUrl, setVideoUrl] = useState('')
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([])
  const [activeCueIndex, setActiveCueIndex] = useState(-1)
  const [activeFileName, setActiveFileName] = useState('')

  const [groups, setGroups] = useState<FileGroup[]>([])
  const [files, setFiles] = useState<MediaFile[]>([])
  const [activeFileId, setActiveFileId] = useState('')

  // #region 初始化加载 IndexedDB 数据
  useEffect(() => {
    ;(async () => {
      const savedGroups = await dbGetAll<FileGroup>('groups')
      const savedFiles = await dbGetAll<MediaFile>('files')
      if (savedGroups.length === 0) {
        const defaultGroup: FileGroup = { id: 'default', name: '默认分组', collapsed: false }
        await dbPut('groups', defaultGroup)
        setGroups([defaultGroup])
      } else {
        setGroups(savedGroups)
      }
      setFiles(savedFiles)
    })()
  }, [])
  // #endregion

  // #region 文件选择与播放
  const handleSelectFile = useCallback(async (file: MediaFile) => {
    if (file.type === 'subtitle') {
      const text = await file.blob.text()
      setSubtitles(parseVTT(text))
      setActiveCueIndex(-1)
      return
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    const url = URL.createObjectURL(file.blob)
    setVideoUrl(url)
    setActiveFileId(file.id)
    setActiveFileName(file.name)
    // 自动加载同组字幕
    const groupSubtitle = files.find((f) => f.groupId === file.groupId && f.type === 'subtitle')
    if (groupSubtitle) {
      const text = await groupSubtitle.blob.text()
      setSubtitles(parseVTT(text))
      setActiveCueIndex(-1)
    } else {
      setSubtitles([])
    }
  }, [videoUrl, files])

  const handleDeleteActiveFile = useCallback(() => {
    setActiveFileId('')
    setVideoUrl('')
    setSubtitles([])
    setActiveFileName('')
  }, [])
  // #endregion

  // #region 播放器初始化与销毁
  useEffect(() => {
    if (!videoUrl || !playerContainerRef.current) return
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    const player = new Player({
      el: playerContainerRef.current,
      url: videoUrl,
      width: '100%',
      height: '100%',
      lang: 'zh',
      playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2],
      keyShortcut: true,
      closeVideoClick: false,
      closeVideoDblclick: false,
    })
    playerRef.current = player
    return () => {
      player.destroy()
      playerRef.current = null
    }
  }, [videoUrl])
  // #endregion

  // #region 字幕同步
  useEffect(() => {
    const player = playerRef.current
    if (!player || subtitles.length === 0) return
    const onTimeUpdate = () => {
      const idx = subtitles.findIndex(
        (cue) => player.currentTime >= cue.startTime && player.currentTime < cue.endTime
      )
      setActiveCueIndex(idx)
    }
    player.on('timeupdate', onTimeUpdate)
    return () => { player.off('timeupdate', onTimeUpdate) }
  }, [subtitles])

  const handleCueClick = useCallback((cue: SubtitleCue) => {
    const player = playerRef.current
    if (!player) return
    player.currentTime = cue.startTime
    if (player.paused) player.play()
  }, [])
  // #endregion

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📝 妙记播放器</h1>
        {activeFileName && <span style={styles.fileName}>正在播放: {activeFileName}</span>}
      </header>

      <div style={styles.main}>
        <FileTree
          groups={groups}
          files={files}
          activeFileId={activeFileId}
          onGroupsChange={setGroups}
          onFilesChange={setFiles}
          onSelectFile={handleSelectFile}
          onDeleteActiveFile={handleDeleteActiveFile}
        />

        <div style={styles.playerPanel}>
          {videoUrl ? (
            <div ref={playerContainerRef} style={styles.playerWrapper} />
          ) : (
            <div style={styles.placeholder}>
              <p style={{ fontSize: 48, margin: 0 }}>🎬</p>
              <p>从左侧媒体库选择文件播放</p>
            </div>
          )}
        </div>

        <SubtitlePanel
          subtitles={subtitles}
          activeCueIndex={activeCueIndex}
          onCueClick={handleCueClick}
        />
      </div>
    </div>
  )
}

// #region 样式
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f5f6f7',
    margin: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 24px',
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
    flexShrink: 0,
  },
  title: { fontSize: 18, fontWeight: 600, margin: 0, color: '#1a1a1a' },
  fileName: { fontSize: 13, color: '#666' },
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
  playerPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minWidth: 0,
  },
  playerWrapper: {
    width: '100%',
    maxWidth: 900,
    aspectRatio: '16/9',
    background: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
    aspectRatio: '16/9',
    background: '#e8e8e8',
    borderRadius: 8,
    color: '#666',
    fontSize: 15,
  },
}
// #endregion
