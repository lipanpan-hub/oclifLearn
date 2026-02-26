import {Command, Flags} from '@oclif/core'
import {Logger, LogLevel} from '../../lib/logger.js'

/**
 * 基础命令类示例
 * 
 * 这个文件展示了如何创建一个基础命令类
 * 其他命令可以继承这个基础类来获得通用功能
 * 
 * 基础命令类的优势：
 * 1. 代码复用 - 通用功能只需实现一次
 * 2. 统一行为 - 所有命令具有一致的行为
 * 3. 易于维护 - 修改基础类即可影响所有子命令
 */

// #region 基础命令类
/**
 * 基础命令类
 * 提供所有命令共享的功能
 */
export abstract class BaseCommand extends Command {
  // 日志记录器实例
  protected logger!: Logger

  // #region 通用 Flags
  /**
   * 所有命令都可以使用的通用 flags
   */
  static baseFlags = {
    verbose: Flags.boolean({
      char: 'v',
      description: '显示详细日志',
      default: false,
    }),

    quiet: Flags.boolean({
      char: 'q',
      description: '静默模式，只显示错误',
      default: false,
    }),

    logLevel: Flags.option({
      description: '日志级别',
      options: ['debug', 'info', 'warn', 'error'] as const,
      default: 'info' as const,
    })(),
  }
  // #endregion

  // #region 初始化方法
  // 在命令执行前初始化 所有子命令都会自动调用这个方法
  async init(): Promise<void> {
    await super.init()

    // 解析 flags
    const {flags} = await this.parse(this.constructor as typeof BaseCommand)

    // 初始化日志记录器
    this.initLogger(flags)

    this.logger.debug('命令初始化完成')
  }
  // #endregion

  // #region 清理方法
  // 在命令执行后清理资源
  async finally(error?: Error): Promise<void> {
    // 如果有错误，记录错误日志
    if (error) {
      this.logger.error(`命令执行失败: ${error.message}`)
    }

    // 关闭日志记录器
    this.logger.close()

    await super.finally(error)
  }
  // #endregion

  // #region 辅助方法
  // 初始化日志记录器
  private initLogger(flags: {
    verbose?: boolean
    quiet?: boolean
    logLevel?: 'debug' | 'info' | 'warn' | 'error'
  }): void {
    // 根据 flags 确定日志级别
    let level = LogLevel.INFO

    if (flags.verbose) {
      level = LogLevel.DEBUG
    } else if (flags.quiet) {
      level = LogLevel.ERROR
    } else if (flags.logLevel) {
      const levelMap = {
        debug: LogLevel.DEBUG,
        info: LogLevel.INFO,
        warn: LogLevel.WARN,
        error: LogLevel.ERROR,
      }
      level = levelMap[flags.logLevel]
    }

    // 创建日志记录器
    this.logger = new Logger({
      level,
      console: true,
      file: false,
      timestamp: true,
      color: true,
    })
  }

  /**
   * 显示成功消息
   */
  protected success(message: string): void {
    this.logger.info(`✓ ${message}`)
  }

  /**
   * 显示警告消息
   */
  protected warning(message: string): void {
    this.logger.warn(`⚠ ${message}`)
  }

  /**
   * 显示错误消息
   */
  protected failure(message: string): void {
    this.logger.error(`✗ ${message}`)
  }

  /**
   * 显示信息消息
   */
  protected info(message: string): void {
    this.logger.info(`ℹ ${message}`)
  }
  // #endregion
}
// #endregion




// #region 示例子命令
/**
 * 继承基础命令的示例命令
 */
export default class BaseCommandExample extends BaseCommand {
  static description = '演示基础命令类的使用'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --verbose',
    '<%= config.bin %> <%= command.id %> --quiet',
    '<%= config.bin %> <%= command.id %> --log-level=debug',
  ]

  static flags = {
    // 继承基础 flags
    ...BaseCommand.baseFlags,

    // 添加命令特定的 flags
    name: Flags.string({
      char: 'n',
      description: '用户名称',
      default: '访客',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(BaseCommandExample)

    // #region 使用基础命令提供的方法
    this.info('开始执行命令')

    this.logger.debug('这是一条调试日志')
    this.logger.info('这是一条信息日志')
    this.logger.warn('这是一条警告日志')

    this.success(`欢迎, ${flags.name}!`)

    // 模拟一些操作
    this.info('正在处理数据...')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    this.success('数据处理完成')

    // 显示警告
    this.warning('这是一个警告示例')

    this.info('命令执行完成')
    // #endregion
  }
}
// #endregion
