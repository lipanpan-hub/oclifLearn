import {Args, Command, Flags} from '@oclif/core'

/**
 * 调试示例命令
 * 
 * 这个命令展示了如何调试 oclif 命令
 * 包括：使用 debugger、日志输出、错误追踪、性能分析等
 * 
 * 调试方法：
 * 
 * 1. 使用 Node.js 内置调试器
 *    node --inspect-brk ./bin/dev.js examples:debug
 *    然后在 Chrome 浏览器打开 chrome://inspect
 * 
 * 2. 使用 VS Code 调试
 *    在 .vscode/launch.json 中配置调试配置（见下方示例）
 *    然后按 F5 启动调试
 * 
 * 3. 使用 console.log 调试
 *    在代码中添加 console.log() 输出关键信息
 * 
 * 4. 使用环境变量
 *    DEBUG=* ./bin/dev.js examples:debug
 *    可以看到更详细的调试信息
 */
export default class DebugExample extends Command {
  static description = '演示如何调试 oclif 命令'

  static examples = [
    {
      description: '基础调试示例',
      command: '<%= config.bin %> <%= command.id %> --name="测试"',
    },
    {
      description: '触发错误进行调试',
      command: '<%= config.bin %> <%= command.id %> --trigger-error',
    },
    {
      description: '性能分析',
      command: '<%= config.bin %> <%= command.id %> --profile',
    },
    {
      description: '使用 Node.js 调试器',
      command: 'node --inspect-brk ./bin/dev.js <%= command.id %>',
    },
  ]

  // #region 参数定义
  static args = {
    data: Args.string({
      description: '要处理的数据',
      required: false,
    }),
  }
  // #endregion

  // #region 标志定义
  static flags = {
    name: Flags.string({
      char: 'n',
      description: '用户名称',
      default: '访客',
    }),

    triggerError: Flags.boolean({
      description: '触发一个错误用于调试',
      default: false,
    }),

    profile: Flags.boolean({
      description: '启用性能分析',
      default: false,
    }),

    breakpoint: Flags.boolean({
      description: '在关键位置设置断点',
      default: false,
    }),
  }
  // #endregion

  async run(): Promise<void> {
    const {args, flags} = await this.parse(DebugExample)

    this.log('\n=== oclif 命令调试示例 ===\n')

    // #region 调试技巧 1: 输出命令上下文信息
    this.log('📋 命令上下文信息:')
    this.log(`  命令 ID: ${this.id}`)
    this.log(`  命令参数: ${JSON.stringify(args)}`)
    this.log(`  命令标志: ${JSON.stringify(flags)}`)
    this.log(`  配置目录: ${this.config.configDir}`)
    this.log(`  数据目录: ${this.config.dataDir}`)
    this.log(`  缓存目录: ${this.config.cacheDir}`)
    this.log('')
    // #endregion

    // #region 调试技巧 2: 使用 debugger 语句
    if (flags.breakpoint) {
      this.log('⏸️  设置断点位置...')
      // 在这里设置断点，使用 node --inspect-brk 运行时会在此处暂停
      // eslint-disable-next-line no-debugger
      debugger
      this.log('✓ 已通过断点\n')
    }
    // #endregion

    // #region 调试技巧 3: 性能分析
    if (flags.profile) {
      await this.performanceAnalysis()
    }
    // #endregion

    // #region 调试技巧 4: 错误追踪
    if (flags.triggerError) {
      await this.demonstrateErrorTracking()
    }
    // #endregion

    // #region 调试技巧 5: 日志级别控制
    this.demonstrateLogging(flags.name)
    // #endregion

    // #region 调试技巧 6: 环境变量调试
    this.demonstrateEnvironmentDebugging()
    // #endregion

    this.log('\n💡 调试提示:')
    this.log('  1. 使用 node --inspect-brk 启动调试器')
    this.log('  2. 在 VS Code 中配置 launch.json')
    this.log('  3. 使用 DEBUG=* 查看详细日志')
    this.log('  4. 在关键位置添加 debugger 语句')
    this.log('  5. 使用 console.time/timeEnd 测量性能')
    this.log('')
  }

  // #region 性能分析示例
  private async performanceAnalysis(): Promise<void> {
    this.log('⏱️  性能分析:')

    // 使用 console.time 测量执行时间
    console.time('总执行时间')

    // 测量异步操作
    console.time('异步操作')
    await this.simulateAsyncOperation(100)
    console.timeEnd('异步操作')

    // 测量同步操作
    console.time('同步操作')
    this.simulateSyncOperation(1000)
    console.timeEnd('同步操作')

    // 测量内存使用
    const memoryUsage = process.memoryUsage()
    this.log(`  内存使用:`)
    this.log(`    RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`)
    this.log(`    堆总量: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`)
    this.log(`    堆使用: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`)

    console.timeEnd('总执行时间')
    this.log('')
  }
  // #endregion

  // #region 错误追踪示例
  private async demonstrateErrorTracking(): Promise<void> {
    this.log('🐛 错误追踪示例:')

    try {
      // 模拟一个错误
      await this.operationThatMightFail()
    } catch (error) {
      // 详细的错误信息
      this.log('  捕获到错误:')
      this.log(`    消息: ${(error as Error).message}`)
      this.log(`    堆栈: ${(error as Error).stack}`)

      // 使用 this.error() 会终止命令执行
      // this.error('命令执行失败', {exit: 1})

      // 使用 this.warn() 只显示警告
      this.warn('这是一个警告，命令会继续执行')
    }

    this.log('')
  }
  // #endregion

  // #region 日志级别控制示例
  private demonstrateLogging(name: string): void {
    this.log('📝 日志输出示例:')

    // 标准输出
    this.log(`  普通日志: 你好, ${name}`)

    // 警告输出
    this.warn('  这是一个警告消息')

    // 调试输出（使用 console.debug）
    console.debug('  这是调试信息（只在 DEBUG 模式下显示）')

    // JSON 输出
    this.logJson({
      type: 'info',
      message: '这是 JSON 格式的日志',
      timestamp: new Date().toISOString(),
    })

    this.log('')
  }
  // #endregion

  // #region 环境变量调试示例
  private demonstrateEnvironmentDebugging(): void {
    this.log('🔧 环境变量调试:')

    // 检查调试环境变量
    const debugEnv = process.env.DEBUG
    this.log(`  DEBUG 环境变量: ${debugEnv || '未设置'}`)

    // 检查 Node 环境
    this.log(`  NODE_ENV: ${process.env.NODE_ENV || '未设置'}`)

    // 自定义调试环境变量
    if (process.env.OCLIF_DEBUG) {
      this.log('  ✓ OCLIF_DEBUG 已启用')
      this.log('  显示额外的调试信息...')
    }

    this.log('')
  }
  // #endregion

  // #region 辅助方法
  private async simulateAsyncOperation(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private simulateSyncOperation(iterations: number): void {
    let sum = 0
    for (let i = 0; i < iterations; i++) {
      sum += i
    }
  }

  private async operationThatMightFail(): Promise<void> {
    // 模拟一个可能失败的操作
    throw new Error('这是一个模拟的错误，用于演示错误追踪')
  }
  // #endregion
}
