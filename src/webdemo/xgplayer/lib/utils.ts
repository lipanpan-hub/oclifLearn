import type { SubtitleCue, MediaFile } from './types'

export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const blocks = content.replace(/\r\n/g, '\n').split('\n\n')

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 2) continue
    const timeLineIdx = lines.findIndex((l) => l.includes('-->'))
    if (timeLineIdx === -1) continue
    const timeMatch = lines[timeLineIdx].match(
      /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/
    )
    if (!timeMatch) continue
    const startTime = parseTimestamp(timeMatch[1])
    const endTime = parseTimestamp(timeMatch[2])
    const text = lines.slice(timeLineIdx + 1).join('\n').replace(/<[^>]+>/g, '')
    const id = timeLineIdx > 0 ? lines[0] : `cue-${cues.length}`
    cues.push({ id, startTime, endTime, text })
  }
  return cues
}

function parseTimestamp(ts: string): number {
  const [h, m, rest] = ts.split(':')
  const [s, ms] = rest.split('.')
  return +h * 3600 + +m * 60 + +s + +ms / 1000
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getFileType(name: string): MediaFile['type'] | null {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) return 'audio'
  if (['vtt', 'srt'].includes(ext)) return 'subtitle'
  return null
}
