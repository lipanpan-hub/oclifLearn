import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import type { SubtitleCue, MediaFile, FileGroup } from './lib/types'
import { parseVTT } from './lib/utils'
import { dbGetAll, dbPut } from './lib/db'
import FileTree from './components/FileTree'
import SubtitlePanel from './components/SubtitlePanel'
import AudioPlayer, { type AudioPlayerHandle } from './components/AudioPlayer'

export default function App() {
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const audioPlayerRef = useRef<AudioPlayerHandle>(null)

  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaKind, setMediaKind] = useState<'video' | 'audio' | ''>('')
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [activeFileName, setActiveFileName] = useState('')

  const [groups, setGroups] = useState<FileGroup[]>([])
  const [files, setFiles] = useState<MediaFile[]>([])
  const [activeFileId, setActiveFileId] = useState('')

  // 当前高亮字幕索引由播放时间派生, 驱动音字同步与逐词高亮
  const activeCueIndex = useMemo(
    () => subtitles.findIndex((c) => currentTime >= c.startTime && currentTime < c.endTime),
    [currentTime, subtitles]
  )

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
  const loadGroupSubtitle = useCallback(async (groupId: string) => {
    const sub = files.find((f) => f.groupId === groupId && f.type === 'subtitle')
    setSubtitles(sub ? parseVTT(await sub.blob.text()) : [])
  }, [files])

  const handleSelectFile = useCallback(async (file: MediaFile) => {
    if (file.type === 'subtitle') {
      setSubtitles(parseVTT(await file.blob.text()))
      return
    }
    if (mediaUrl) URL.revokeObjectURL(mediaUrl)
    setMediaUrl(URL.createObjectURL(file.blob))
    setMediaKind(file.type)
    setActiveFileId(file.id)
    setActiveFileName(file.name)
    setCurrentTime(0)
    await loadGroupSubtitle(file.groupId)
  }, [mediaUrl, loadGroupSubtitle])

  const handleDeleteActiveFile = useCallback(() => {
    setActiveFileId('')
    setMediaUrl('')
    setMediaKind('')
    setSubtitles([])
    setActiveFileName('')
    setCurrentTime(0)
  }, [])
  // #endregion

  // #region 视频播放器初始化(xgplayer) + rAF 上报进度
  useEffect(() => {
    if (mediaKind !== 'video' || !mediaUrl || !playerContainerRef.current) return
    const player = new Player({
      el: playerContainerRef.current,
      url: mediaUrl,
      width: '100%',
      height: '100%',
      lang: 'zh',
      playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2],
      keyShortcut: true,
      closeVideoClick: false,
      closeVideoDblclick: false,
    })
    playerRef.current = player

    let raf = 0
    const loop = () => {
      setCurrentTime(player.currentTime)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      player.destroy()
      playerRef.current = null
    }
  }, [mediaKind, mediaUrl])
  // #endregion

  // #region 音字同步定位: 点击文字跳转进度
  const handleCueClick = useCallback((cue: SubtitleCue) => {
    if (mediaKind === 'audio') {
      audioPlayerRef.current?.seek(cue.startTime)
      audioPlayerRef.current?.play()
    } else {
      const player = playerRef.current
      if (!player) return
      player.currentTime = cue.startTime
      if (player.paused) player.play()
    }
  }, [mediaKind])
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

        {mediaKind === 'audio' ? (
          // 音频模式: 顶部进度条 + 下方逐字稿
          <div style={styles.audioLayout}>
            <AudioPlayer
              ref={audioPlayerRef}
              url={mediaUrl}
              name={activeFileName}
              onTimeUpdate={setCurrentTime}
            />
            <SubtitlePanel
              subtitles={subtitles}
              activeCueIndex={activeCueIndex}
              currentTime={currentTime}
              onCueClick={handleCueClick}
              fullWidth
            />
          </div>
        ) : (
          // 视频模式: 播放器 + 右侧逐字稿
          <>
            <div style={styles.playerPanel}>
              {mediaKind === 'video' ? (
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
              currentTime={currentTime}
              onCueClick={handleCueClick}
            />
          </>
        )}
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
  audioLayout: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: '#fff',
  },
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
