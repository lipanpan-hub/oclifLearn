import React, { useState, useCallback } from 'react'
import type { FileGroup, MediaFile } from '../lib/types'
import { dbPut, dbDelete } from '../lib/db'
import { genId, getFileType } from '../lib/utils'

interface FileTreeProps {
  groups: FileGroup[]
  files: MediaFile[]
  activeFileId: string
  onGroupsChange: (groups: FileGroup[]) => void
  onFilesChange: (files: MediaFile[]) => void
  onSelectFile: (file: MediaFile) => void
  onDeleteActiveFile: () => void
}

export default function FileTree({
  groups, files, activeFileId,
  onGroupsChange, onFilesChange, onSelectFile, onDeleteActiveFile,
}: FileTreeProps) {
  const [renamingId, setRenamingId] = useState('')
  const [renameValue, setRenameValue] = useState('')

  // #region 分组操作
  const handleAddGroup = useCallback(async () => {
    const group: FileGroup = { id: genId(), name: '新分组', collapsed: false }
    await dbPut('groups', group)
    onGroupsChange([...groups, group])
    setRenamingId(group.id)
    setRenameValue(group.name)
  }, [groups, onGroupsChange])

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    if (groupId === 'default') return
    const groupFiles = files.filter((f) => f.groupId === groupId)
    for (const f of groupFiles) await dbDelete('files', f.id)
    await dbDelete('groups', groupId)
    onFilesChange(files.filter((f) => f.groupId !== groupId))
    onGroupsChange(groups.filter((g) => g.id !== groupId))
  }, [files, groups, onFilesChange, onGroupsChange])

  const toggleGroupCollapse = useCallback(async (groupId: string) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g
      return { ...g, collapsed: !g.collapsed }
    })
    const target = updated.find((g) => g.id === groupId)
    if (target) await dbPut('groups', target)
    onGroupsChange(updated)
  }, [groups, onGroupsChange])
  // #endregion

  // #region 文件操作
  const handleAddFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const fileList = e.target.files
    if (!fileList) return
    const newFiles: MediaFile[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const type = getFileType(file.name)
      if (!type) continue
      const mediaFile: MediaFile = { id: genId(), name: file.name, type, groupId, blob: file }
      newFiles.push(mediaFile)
      await dbPut('files', mediaFile)
    }
    onFilesChange([...files, ...newFiles])
    e.target.value = ''
  }, [files, onFilesChange])

  const handleDeleteFile = useCallback(async (fileId: string) => {
    await dbDelete('files', fileId)
    onFilesChange(files.filter((f) => f.id !== fileId))
    if (activeFileId === fileId) onDeleteActiveFile()
  }, [files, activeFileId, onFilesChange, onDeleteActiveFile])
  // #endregion

  // #region 重命名
  const handleRenameSubmit = useCallback(async (id: string, isGroup: boolean) => {
    if (!renameValue.trim()) { setRenamingId(''); return }
    if (isGroup) {
      const updated = groups.map((g) => g.id === id ? { ...g, name: renameValue.trim() } : g)
      const target = updated.find((g) => g.id === id)
      if (target) await dbPut('groups', target)
      onGroupsChange(updated)
    } else {
      const updated = files.map((f) => f.id === id ? { ...f, name: renameValue.trim() } : f)
      const target = updated.find((f) => f.id === id)
      if (target) await dbPut('files', target)
      onFilesChange(updated)
    }
    setRenamingId('')
  }, [renameValue, groups, files, onGroupsChange, onFilesChange])
  // #endregion

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>媒体库</span>
        <button style={styles.addGroupBtn} onClick={handleAddGroup} title="新建分组">+</button>
      </div>
      <div style={styles.list}>
        {groups.map((group) => (
          <div key={group.id}>
            <div style={styles.groupHeader}>
              <span style={styles.collapseIcon} onClick={() => toggleGroupCollapse(group.id)}>
                {group.collapsed ? '▶' : '▼'}
              </span>
              {renamingId === group.id ? (
                <input
                  style={styles.renameInput}
                  value={renameValue}
                  autoFocus
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(group.id, true)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(group.id, true) }}
                />
              ) : (
                <span
                  style={styles.groupName}
                  onDoubleClick={() => { setRenamingId(group.id); setRenameValue(group.name) }}
                >
                  📁 {group.name}
                </span>
              )}
              <div style={styles.groupActions}>
                <label style={styles.tinyBtn} title="添加文件">
                  +
                  <input type="file" multiple accept="video/*,audio/*,.vtt,.srt" onChange={(e) => handleAddFiles(e, group.id)} hidden />
                </label>
                {group.id !== 'default' && (
                  <span style={styles.tinyBtn} title="删除分组" onClick={() => handleDeleteGroup(group.id)}>×</span>
                )}
              </div>
            </div>
            {!group.collapsed && (
              <div style={styles.fileList}>
                {files.filter((f) => f.groupId === group.id).map((file) => (
                  <div
                    key={file.id}
                    style={{ ...styles.fileItem, ...(file.id === activeFileId ? styles.fileItemActive : {}) }}
                    onClick={() => onSelectFile(file)}
                  >
                    <span style={styles.fileIcon}>
                      {file.type === 'video' ? '🎬' : file.type === 'audio' ? '🎵' : '📄'}
                    </span>
                    {renamingId === file.id ? (
                      <input
                        style={styles.renameInput}
                        value={renameValue}
                        autoFocus
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(file.id, false)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(file.id, false) }}
                      />
                    ) : (
                      <span
                        style={styles.fileName}
                        onDoubleClick={() => { setRenamingId(file.id); setRenameValue(file.name) }}
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    )}
                    <span
                      style={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id) }}
                      title="删除"
                    >×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// #region 样式
const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 240,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#fafafa',
    borderRight: '1px solid #e8e8e8',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 600,
    borderBottom: '1px solid #f0f0f0',
    flexShrink: 0,
  },
  addGroupBtn: {
    width: 22, height: 22,
    border: '1px solid #d9d9d9', borderRadius: 4,
    background: '#fff', cursor: 'pointer',
    fontSize: 14, lineHeight: '20px', textAlign: 'center' as const,
  },
  list: { flex: 1, overflowY: 'auto' as const, padding: '4px 0' },
  groupHeader: {
    display: 'flex', alignItems: 'center',
    padding: '6px 8px', gap: 4,
    fontSize: 13, fontWeight: 500, userSelect: 'none' as const,
  },
  collapseIcon: { cursor: 'pointer', fontSize: 10, width: 14, textAlign: 'center' as const },
  groupName: { flex: 1, cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  groupActions: { display: 'flex', gap: 2, marginLeft: 'auto' },
  tinyBtn: {
    width: 18, height: 18,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid #d9d9d9', borderRadius: 3,
    background: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: '16px',
  },
  fileList: { paddingLeft: 22 },
  fileItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 8px', fontSize: 12,
    cursor: 'pointer', borderRadius: 4, transition: 'background 0.15s',
  },
  fileItemActive: { background: '#e6f7ff' },
  fileIcon: { flexShrink: 0 },
  fileName: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  deleteBtn: { opacity: 0.4, cursor: 'pointer', fontSize: 14, flexShrink: 0 },
  renameInput: {
    flex: 1, fontSize: 12, padding: '2px 4px',
    border: '1px solid #1890ff', borderRadius: 3, outline: 'none',
  },
}
// #endregion
