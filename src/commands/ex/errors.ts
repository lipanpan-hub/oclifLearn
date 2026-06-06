import {Command, Flags} from '@oclif/core'
import {CLIError} from '@oclif/core/errors'

/**
 * Errors 示例命令
 * 
 * 这个命令展示了 oclif 中错误处理的各种方式
 * 包括不同类型的错误、错误码、退出状态等
 * 
 * 运行示例：
 * oclifLearn examples:errors --type=cli
 * oclifLearn examples:errors --type=validation
 * oclifLearn examples:errors --type=warning
 */
export default class ErrorsExample extends Command {
  static description = '演示 oclif 中各种错误处理方式'

  static examples = [
    '<%= config.bin %> <%= command.id %> --type=cli',
    '<%= config.bin %> <%= command.id %> --type=validation',
    '<%= config.bin %> <%= command.id %> --type=warning',
    '<%= config.bin %> <%= command.id %> --type=exit',
  ]

  static flags = {
    type: Flags.option({
      description: '错误类型',
      options: ['cli', 'validation', 'warning', 'exit', 'custom'] as const,
      required: true,
    })(),

    code: Flags.integer({
      description: '退出码',
      default: 1,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(ErrorsExample)

    this.log(`\n=== 演示 ${flags.type} 错误类型 ===\n`)

    switch (flags.type) {
      // #region CLI 错误
      // 标准的 CLI 错误，会显示错误信息并退出
      case 'cli': {
        this.log('即将抛出 CLI 错误...\n')
        throw new CLIError('这是一个 CLI 错误示例')
      }
      // #endregion

      // #region 验证错误
      // 带有建议的验证错误
      case 'validation': {
        this.log('即将抛出验证错误...\n')
        this.error('验证失败: 用户名不能为空', {
          code: 'VALIDATION_ERROR',
          suggestions: ['请提供有效的用户名', '用户名长度应在 3-20 个字符之间'],
        })
        break
      }
      // #endregion

      // #region 警告
      // 显示警告但不退出程序
      case 'warning': {
        this.log('显示警告信息...\n')
        this.warn('这是一个警告: 配置文件未找到，使用默认配置')
        this.log('\n程序继续执行...')
        this.log('警告不会中断程序执行')
        break
      }
      // #endregion

      // #region 自定义退出码
      // 使用自定义退出码退出
      case 'exit': {
        this.log(`即将以退出码 ${flags.code} 退出...\n`)
        this.error(`操作失败，退出码: ${flags.code}`, {
          exit: flags.code,
        })
        break
      }
      // #endregion

      // #region 自定义错误类
      // 使用自定义错误类
      case 'custom': {
        this.log('即将抛出自定义错误...\n')
        throw new CustomError('这是一个自定义错误', {
          code: 'CUSTOM_ERROR',
          statusCode: 500,
        })
      }
      // #endregion
    }
  }

  // #region 错误捕获钩子
  /**
   * catch 方法会在命令执行过程中捕获所有错误
   * 可以在这里进行统一的错误处理和日志记录
   */
  async catch(error: Error): Promise<void> {
    this.log('\n=== 错误被捕获 ===')
    this.log(`错误类型: ${error.constructor.name}`)
    this.log(`错误信息: ${error.message}`)

    if (error instanceof CustomError) {
      this.log(`错误码: ${error.code}`)
      this.log(`状态码: ${error.statusCode}`)
    }

    // 重新抛出错误，让 oclif 处理
    throw error
  }
  // #endregion
}

// #region 自定义错误类
/**
 * 自定义错误类示例
 * 继承自 CLIError，可以添加额外的属性和方法
 */
class CustomError extends CLIError {
  code: string
  statusCode: number

  constructor(
    message: string,
    options: {
      code: string
      statusCode: number
    },
  ) {
    super(message)
    this.code = options.code
    this.statusCode = options.statusCode
  }
}
// #endregion
