/**
 * Init Hook 示例
 * 
 * 这个 hook 在命令执行之前运行
 * 可以用于初始化配置、验证环境、设置全局状态等
 * 
 * oclif 的 hook 生命周期：
 * 1. init - 在命令执行前运行
 * 2. prerun - 在命令的 run 方法执行前运行
 * 3. postrun - 在命令的 run 方法执行后运行
 * 4. command_not_found - 当命令未找到时运行
 */

import {Hook} from '@oclif/core'
import makeDebug from 'debug'

// 创建 debug 实例，命名空间为 'oclifLearn:hooks:init'
// const debug = makeDebug('oclifLearn:hooks:init')

/**
 * Init Hook
 * 在任何命令执行之前都会运行这个 hook
 */
const hook: Hook<'init'> = async function (options) {
  // #region 访问 hook 上下文
  // options.id - 当前执行的命令 ID
  // options.config - oclif 配置对象
  // #endregion

  // #region 环境检查
  // 检查 Node.js 版本
  const nodeVersion = process.version
  const requiredVersion = 'v18.0.0'

  if (nodeVersion < requiredVersion) {
    this.warn(`当前 Node.js 版本 ${nodeVersion} 低于推荐版本 ${requiredVersion}`)
  }
  // #endregion

  // #region 配置初始化
  // 可以在这里初始化全局配置
  // 例如：加载环境变量、设置默认值等
  if (!process.env.API_BASE_URL) {
    process.env.API_BASE_URL = 'https://api.example.com'
  }
  // #endregion

  // #region 日志记录
  // 使用 debug 记录命令执行信息
  // 需要设置 DEBUG=oclifLearn:* 或 DEBUG=* 才能看到输出
  if (options.id) {
    this.debug(`正在执行命令: ${options.id}`)
  }

  // 如果想要总是输出，可以使用 this.log
  // this.log(`正在执行命令: ${options.id}`)

  // 如果想要输出警告，可以使用 this.warn
  // this.warn(`正在执行命令: ${options.id}`)
  // #endregion

  // #region 性能监控
  // 记录命令开始时间，用于性能分析
  ;(global as {commandStartTime?: number}).commandStartTime = Date.now()
  // #endregion
}

export default hook
