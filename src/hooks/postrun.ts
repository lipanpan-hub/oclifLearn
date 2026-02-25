/**
 * Postrun Hook 示例
 * 
 * 这个 hook 在命令的 run 方法执行之后运行
 * 可以用于清理资源、记录执行结果、性能统计等
 */

import {Hook} from '@oclif/core'

/**
 * Postrun Hook
 * 在命令的 run 方法执行后运行
 */
const hook: Hook<'postrun'> = async function (options) {
  // #region 访问命令信息
  // options.Command - 命令类
  // options.argv - 命令行参数数组
  // options.config - oclif 配置对象
  // #endregion

  // #region 性能统计
  const startTime = (global as {commandStartTime?: number}).commandStartTime
  if (startTime) {
    const duration = Date.now() - startTime
    this.debug(`命令执行耗时: ${duration}ms`)
  }
  // #endregion

  // #region 执行结果记录
  this.debug(`命令执行完成: ${options.Command.id}`)
  // #endregion

  // #region 清理工作
  // 可以在这里进行资源清理
  // 例如：关闭数据库连接、清理临时文件等
  // #endregion

  // #region 使用统计
  // 可以在这里记录命令使用情况
  // 例如：发送匿名使用统计、更新本地使用记录等
  // #endregion
}

export default hook
