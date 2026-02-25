/**
 * Command Not Found Hook 示例
 * 
 * 这个 hook 在命令未找到时运行
 * 可以用于提供命令建议、显示帮助信息等
 */

import {Hook} from '@oclif/core'

/**
 * Command Not Found Hook
 * 当用户输入的命令不存在时运行
 */
const hook: Hook<'command_not_found'> = async function (options) {
  // #region 访问命令信息
  // options.id - 用户输入的命令 ID
  // options.config - oclif 配置对象
  // #endregion

  const commandId = options.id

  // #region 获取所有可用命令
  const allCommands = options.config.commands
  const commandIds = allCommands.map((cmd) => cmd.id)
  // #endregion

  // #region 查找相似命令
  // 使用简单的字符串相似度算法查找可能的命令
  const suggestions = findSimilarCommands(commandId, commandIds)
  // #endregion

  // #region 显示错误和建议
  this.log(`\n错误: 命令 "${commandId}" 未找到\n`)

  if (suggestions.length > 0) {
    this.log('您是否想要执行以下命令之一？\n')
    for (const suggestion of suggestions) {
      this.log(`  ${suggestion}`)
    }

    this.log('')
  }

  this.log('运行 "oclifLearn --help" 查看所有可用命令')
  // #endregion
}

/**
 * 查找相似命令
 * 使用 Levenshtein 距离算法
 */
function findSimilarCommands(input: string, commands: string[]): string[] {
  const maxDistance = 3
  const similar: Array<{command: string; distance: number}> = []

  for (const command of commands) {
    const distance = levenshteinDistance(input, command)
    if (distance <= maxDistance) {
      similar.push({command, distance})
    }
  }

  // 按距离排序，返回最相似的 3 个命令
  return similar
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((item) => item.command)
}

/**
 * 计算 Levenshtein 距离
 * 用于衡量两个字符串的相似度
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  // 初始化矩阵
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  // 计算距离
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j] + 1, // 删除
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export default hook
