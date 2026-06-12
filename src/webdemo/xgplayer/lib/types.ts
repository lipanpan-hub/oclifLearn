export interface SubtitleWord {
  text: string
  startTime: number
  endTime: number
}

export interface SubtitleCue {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
  words: SubtitleWord[]
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
