/**
 * 日志工具
 * 
 * 这个模块展示了如何在 oclif 项目中实现日志功能
 * 包括不同级别的日志、日志格式化、日志文件写入等
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// #region 日志级别定义
/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 日志级别名称映射
 */
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
}
// #endregion

// #region 日志配置接口
/**
 * 日志配置接口
 */
export interface LoggerConfig {
  // 最低日志级别
  level: LogLevel
  // 是否输出到控制台
  console: boolean
  // 是否写入文件
  file: boolean
  // 日志文件路径
  filePath?: string
  // 是否包含时间戳
  timestamp: boolean
  // 是否使用彩色输出
  color: boolean
}
// #endregion

// #region Logger 类
/**
 * 日志记录器类
 */
export class Logger {
  private config: LoggerConfig
  private fileStream?: fs.WriteStream

  constructor(config: Partial<LoggerConfig> = {}) {
    // 合并默认配置
    this.config = {
      level: LogLevel.INFO,
      console: true,
      file: false,
      timestamp: true,
      color: true,
      ...config,
    }

    // 如果启用文件日志，创建文件流
    if (this.config.file && this.config.filePath) {
      this.initFileStream()
    }
  }

  /**
   * 初始化文件流
   */
  private initFileStream(): void {
    if (!this.config.filePath) return

    try {
      // 确保目录存在
      const dir = path.dirname(this.config.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
      }

      // 创建写入流
      this.fileStream = fs.createWriteStream(this.config.filePath, {flags: 'a'})
    } catch (error) {
      console.error(`创建日志文件失败: ${error}`)
    }
  }

  /**
   * 记录 DEBUG 级别日志
   */
  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  /**
   * 记录 INFO 级别日志
   */
  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  /**
   * 记录 WARN 级别日志
   */
  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  /**
   * 记录 ERROR 级别日志
   */
  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    // 检查日志级别
    if (level < this.config.level) {
      return
    }

    // 格式化日志消息
    const formattedMessage = this.formatMessage(level, message, ...args)

    // 输出到控制台
    if (this.config.console) {
      this.logToConsole(level, formattedMessage)
    }

    // 写入文件
    if (this.config.file && this.fileStream) {
      this.logToFile(formattedMessage)
    }
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const parts: string[] = []

    // 添加时间戳
    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    // 添加日志级别
    parts.push(`[${LOG_LEVEL_NAMES[level]}]`)

    // 添加消息
    parts.push(message)

    // 添加额外参数
    if (args.length > 0) {
      parts.push(JSON.stringify(args))
    }

    return parts.join(' ')
  }

  /**
   * 输出到控制台
   */
  private logToConsole(level: LogLevel, message: string): void {
    if (this.config.color) {
      // 使用彩色输出
      const coloredMessage = this.colorize(level, message)
      console.log(coloredMessage)
    } else {
      console.log(message)
    }
  }

  /**
   * 写入日志文件
   */
  private logToFile(message: string): void {
    if (this.fileStream) {
      this.fileStream.write(message + '\n')
    }
  }

  /**
   * 为日志消息添加颜色
   */
  private colorize(level: LogLevel, message: string): string {
    const colors = {
      [LogLevel.DEBUG]: '\u001B[36m', // 青色
      [LogLevel.INFO]: '\u001B[32m', // 绿色
      [LogLevel.WARN]: '\u001B[33m', // 黄色
      [LogLevel.ERROR]: '\u001B[31m', // 红色
    }

    const reset = '\u001B[0m'
    return `${colors[level]}${message}${reset}`
  }

  /**
   * 关闭日志记录器
   */
  close(): void {
    if (this.fileStream) {
      this.fileStream.end()
    }
  }
}
// #endregion

// #region 全局日志实例
/**
 * 创建全局日志实例
 */
let globalLogger: Logger | null = null

/**
 * 获取全局日志实例
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger()
  }

  return globalLogger
}

/**
 * 设置全局日志实例
 */
export function setLogger(logger: Logger): void {
  globalLogger = logger
}
// #endregion
