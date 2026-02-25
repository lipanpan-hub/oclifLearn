/**
 * Prerun Hook 示例
 * 
 * 这个 hook 在命令的 run 方法执行之前运行
 * 可以用于参数验证、权限检查、日志记录等
 */

import {Hook} from '@oclif/core'

/**
 * Prerun Hook
 * 在命令的 run 方法执行前运行
 */
const hook: Hook<'prerun'> = async function (options) {
  // #region 访问命令信息
  // options.Command - 命令类
  // options.argv - 命令行参数数组
  // options.config - oclif 配置对象
  // #endregion

  // #region 日志记录
  this.debug(`准备执行命令: ${options.Command.id}`)
  this.debug(`参数: ${JSON.stringify(options.argv)}`)
  // #endregion

  // #region 权限检查示例
  // 检查是否有执行权限
  const restrictedCommands = ['examples:errors']

  if (options.Command.id && restrictedCommands.includes(options.Command.id)) {
    // 可以在这里添加权限验证逻辑
    this.debug(`执行受限命令: ${options.Command.id}`)
  }
  // #endregion

  // #region 参数预处理
  // 可以在这里对参数进行预处理或验证
  if (options.argv.includes('--debug')) {
    this.debug('调试模式已启用')
  }
  // #endregion
}

export default hook
