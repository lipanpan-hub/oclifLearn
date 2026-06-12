import type { SubtitleCue, SubtitleWord, MediaFile } from './types'

// #region VTT 解析
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
    const rawText = lines.slice(timeLineIdx + 1).join('\n')
    const id = timeLineIdx > 0 ? lines[0] : `cue-${cues.length}`

    const { speaker, body } = extractSpeaker(rawText)
    const words = parseWords(body, startTime, endTime)
    const text = words.map((w) => w.text).join('').trim()

    cues.push({ id, startTime, endTime, text, speaker, words })
  }
  return cues
}

function extractSpeaker(text: string): { speaker?: string; body: string } {
  // 标准 WebVTT 发言人标签 <v 发言人>...</v>
  const tagMatch = text.match(/<v(?:\.\S+)?\s+([^>]+)>/i)
  if (tagMatch) {
    const body = text.replace(/<v(?:\.\S+)?\s+[^>]+>/i, '').replace(/<\/v>/gi, '')
    return { speaker: tagMatch[1].trim(), body }
  }
  // 飞书妙记常见格式: "发言人 1  00:11" 单独成行后接文本, 或 "发言人：文本"
  const colonMatch = text.match(/^([^\s:：][^:：\n]{0,15})[：:]\s*([\s\S]+)$/)
  if (colonMatch && /^(发言人|说话人|主持人|嘉宾|speaker)/i.test(colonMatch[1])) {
    return { speaker: colonMatch[1].trim(), body: colonMatch[2] }
  }
  return { body: text }
}

function parseWords(body: string, start: number, end: number): SubtitleWord[] {
  // 优先解析内联时间戳 <00:00:01.000>词
  if (/<\d{2}:\d{2}:\d{2}\.\d{3}>/.test(body)) {
    return parseTimestampedWords(body, start, end)
  }
  // 降级: 无词级时间戳时按 token 时长均分, 模拟逐词高亮
  const clean = body.replace(/<[^>]+>/g, '').trim()
  const tokens = clean.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9']+|\s+|[^\s]/g) || []
  if (tokens.length === 0) return []
  // 仅按非空白 token 数量分配时间, 空白继承前一个时间
  const visibleCount = tokens.filter((t) => t.trim()).length || 1
  const step = (end - start) / visibleCount
  const words: SubtitleWord[] = []
  let cursor = start
  for (const t of tokens) {
    if (t.trim()) {
      words.push({ text: t, startTime: cursor, endTime: cursor + step })
      cursor += step
    } else {
      words.push({ text: t, startTime: cursor, endTime: cursor })
    }
  }
  return words
}

function parseTimestampedWords(body: string, start: number, end: number): SubtitleWord[] {
  const clean = body.replace(/<\/?v[^>]*>/gi, '')
  const segs = clean.split(/<(\d{2}:\d{2}:\d{2}\.\d{3})>/)
  const words: SubtitleWord[] = []
  let prevTime = start
  let prevText = segs[0]
  for (let i = 1; i < segs.length; i += 2) {
    const ts = parseTimestamp(segs[i])
    if (prevText && prevText.trim()) words.push({ text: prevText, startTime: prevTime, endTime: ts })
    prevTime = ts
    prevText = segs[i + 1] ?? ''
  }
  if (prevText && prevText.trim()) words.push({ text: prevText, startTime: prevTime, endTime: end })
  return words
}

function parseTimestamp(ts: string): number {
  const [h, m, rest] = ts.split(':')
  const [s, ms] = rest.split('.')
  return +h * 3600 + +m * 60 + +s + +ms / 1000
}
// #endregion

// #region 通用工具
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

// 根据发言人名稳定映射到一组颜色, 用于发言人区分
const SPEAKER_COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d']

export function speakerColor(speaker: string): string {
  let h = 0
  for (const ch of speaker) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return SPEAKER_COLORS[h % SPEAKER_COLORS.length]
}
// #endregion
