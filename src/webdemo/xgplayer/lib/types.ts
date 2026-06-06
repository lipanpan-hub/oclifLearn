export interface SubtitleCue {
  id: string
  startTime: number
  endTime: number
  text: string
}

export interface MediaFile {
  id: string
  name: string
  type: 'video' | 'audio' | 'subtitle'
  groupId: string
  blob: Blob
  url?: string
}

export interface FileGroup {
  id: string
  name: string
  collapsed: boolean
}
