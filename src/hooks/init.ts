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

/**
 * Init Hook
 * 在任何命令执行之前都会运行这个 hook
 */
const hook: Hook<'init'> = async function (options) {
  // #region 打印 options 对象的完整内容
  this.debug('=== Init Hook Options 完整内容 ===')
  this.debug('options.id:', options.id)
  this.debug('options.argv:', options.argv)
  
  // 打印 config 对象的主要属性
  if (options.config) {
    this.debug('--- options.config 主要属性 ---')
    this.debug('config.name:', options.config.name)
    this.debug('config.version:', options.config.version)
    this.debug('config.bin:', options.config.bin)
    this.debug('config.root:', options.config.root)
    this.debug('config.dataDir:', options.config.dataDir)
    this.debug('config.cacheDir:', options.config.cacheDir)
    this.debug('config.configDir:', options.config.configDir)
    this.debug('config.platform:', options.config.platform)
    this.debug('config.arch:', options.config.arch)
    this.debug('config.shell:', options.config.shell)
    this.debug('config.userAgent:', options.config.userAgent)
    this.debug('config.npmRegistry:', options.config.npmRegistry)
    this.debug('config.pjson (package.json):', JSON.stringify(options.config.pjson, null, 2))
  }
  
  this.debug('=== Options 对象打印完毕 ===')
  // #endregion

  // #region 访问 hook 上下文
  // options.id - 当前执行的命令 ID
  // options.argv - 命令行参数数组
  // options.config - oclif 配置对象，包含：
  //   - name: CLI 名称
  //   - version: CLI 版本
  //   - bin: 可执行文件名
  //   - root: CLI 根目录
  //   - dataDir: 数据目录
  //   - cacheDir: 缓存目录
  //   - configDir: 配置目录
  //   - platform: 操作系统平台
  //   - arch: CPU 架构
  //   - shell: 当前 shell
  //   - pjson: package.json 内容
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
