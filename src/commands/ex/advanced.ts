import {Args, Command, Flags} from '@oclif/core'
import {ApiClient} from '../../lib/api-client.js'

/**
 * Advanced 示例命令
 * 
 * 这个命令展示了 oclif 的高级特性
 * 包括：命令别名、动态帮助、自定义解析、API 集成等
 * 
 * 运行示例：
 * oclifLearn examples:advanced fetch --url="https://api.github.com/users/github"
 * oclifLearn examples:advanced process data.json --format=json
 */
export default class AdvancedExample extends Command {
  static description = '演示 oclif 的高级特性'

  // #region 命令别名
  static aliases = ['adv', 'advanced']
  // #endregion

  // #region 命令示例
  static examples = [
    {
      description: '从 API 获取数据',
      command: '<%= config.bin %> <%= command.id %> fetch --url="https://api.github.com/users/github"',
    },
    {
      description: '处理本地文件',
      command: '<%= config.bin %> <%= command.id %> process data.json --format=json',
    },
    {
      description: '使用管道输入',
      command: 'echo "test data" | <%= config.bin %> <%= command.id %> process --format=text',
    },
  ]
  // #endregion

  // #region 参数定义
  static args = {
    action: Args.string({
      description: '要执行的操作',
      required: true,
      options: ['fetch', 'process', 'transform'],
    }),

    input: Args.string({
      description: '输入数据或文件路径',
      required: false,
    }),
  }
  // #endregion

  // #region 标志定义
  static flags = {
    // #region URL 标志
    url: Flags.url({
      char: 'u',
      description: 'API 端点 URL',
      dependsOn: ['action'],
    }),
    // #endregion

    // #region 格式标志
    format: Flags.option({
      char: 'f',
      description: '输出格式',
      options: ['json', 'yaml', 'text', 'table'] as const,
      default: 'json' as const,
    })(),
    // #endregion

    // #region 超时标志
    timeout: Flags.integer({
      char: 't',
      description: '请求超时时间（毫秒）',
      default: 5000,
    }),
    // #endregion

    // #region 输出文件标志
    output: Flags.file({
      char: 'o',
      description: '输出文件路径',
    }),
    // #endregion

    // #region 详细模式标志
    verbose: Flags.boolean({
      char: 'v',
      description: '显示详细信息',
      default: false,
    }),
    // #endregion

    // #region 自定义头部标志
    headers: Flags.custom<Record<string, string>>({
      char: 'H',
      description: 'HTTP 请求头（格式: key:value）',
      multiple: true,
      parse: async (input) => {
        const [key, value] = input.split(':')
        if (!key || !value) {
          throw new Error('无效的头部格式，请使用: key:value')
        }

        return {[key.trim()]: value.trim()}
      },
    })(),
    // #endregion
  }

  // #region 严格模式
  /**
   * 启用严格模式
   * 不允许未定义的 flags
   */
  static strict = true
  // #endregion

  async run(): Promise<void> {
    const {args, flags} = await this.parse(AdvancedExample)

    this.log('\n=== oclif 高级特性示例 ===\n')

    // #region 根据操作执行不同的逻辑
    switch (args.action) {
      case 'fetch': {
        await this.handleFetch(flags)
        break
      }

      case 'process': {
        await this.handleProcess(args.input, flags)
        break
      }

      case 'transform': {
        await this.handleTransform(args.input, flags)
        break
      }
    }
    // #endregion
  }

  // #region Fetch 操作
  /**
   * 处理 fetch 操作
   * 从 API 获取数据
   */
  private async handleFetch(flags: {
    url?: URL
    timeout: number
    headers?: Array<Record<string, string>>
    format: 'json' | 'yaml' | 'text' | 'table'
    verbose: boolean
    output?: string
  }): Promise<void> {
    if (!flags.url) {
      this.error('fetch 操作需要 --url 参数')
    }

    this.log(`正在从 ${flags.url} 获取数据...\n`)

    // #region 显示进度
    this.log('获取数据...')
    // #endregion

    try {
      // #region 创建 API 客户端
      const apiClient = new ApiClient({
        baseUrl: flags.url.origin,
        timeout: flags.timeout,
        retries: 3,
        headers: this.mergeHeaders(flags.headers),
      })
      // #endregion

      // #region 发送请求
      const response = await apiClient.get(flags.url.pathname)
      this.log('完成\n')
      // #endregion

      // #region 显示结果
      this.log('\n=== 响应数据 ===\n')
      this.displayData(response.data, flags.format)

      if (flags.verbose) {
        this.log('\n=== 响应头 ===\n')
        this.log(JSON.stringify(response.headers, null, 2))
      }
      // #endregion

      // #region 保存到文件
      if (flags.output) {
        await this.saveToFile(flags.output, response.data)
        this.log(`\n数据已保存到: ${flags.output}`)
      }
      // #endregion
    } catch (error) {
      this.log('失败\n')
      this.error(`获取数据失败: ${(error as Error).message}`)
    }
  }
  // #endregion

  // #region Process 操作
  /**
   * 处理 process 操作
   * 处理输入数据
   */
  private async handleProcess(
    input: string | undefined,
    flags: {
      format: 'json' | 'yaml' | 'text' | 'table'
      verbose: boolean
    },
  ): Promise<void> {
    this.log('正在处理数据...\n')

    // #region 读取输入
    let data: unknown
    if (input) {
      // 从文件或参数读取
      data = {input, processed: true, timestamp: new Date().toISOString()}
    } else {
      // 从标准输入读取
      this.log('等待标准输入...')
      data = {message: '从标准输入读取的数据'}
    }
    // #endregion

    // #region 显示结果
    this.log('=== 处理结果 ===\n')
    this.displayData(data, flags.format)
    // #endregion
  }
  // #endregion

  // #region Transform 操作
  /**
   * 处理 transform 操作
   * 转换数据格式
   */
  private async handleTransform(
    input: string | undefined,
    flags: {
      format: 'json' | 'yaml' | 'text' | 'table'
    },
  ): Promise<void> {
    this.log('正在转换数据...\n')

    const data = {
      original: input,
      transformed: input?.toUpperCase(),
      length: input?.length || 0,
    }

    this.displayData(data, flags.format)
  }
  // #endregion

  // #region 辅助方法
  /**
   * 显示数据
   */
  private displayData(data: unknown, format: 'json' | 'yaml' | 'text' | 'table'): void {
    switch (format) {
      case 'json': {
        this.log(JSON.stringify(data, null, 2))
        break
      }

      case 'yaml': {
        // 简单的 YAML 格式化
        this.log(this.toYaml(data))
        break
      }

      case 'text': {
        this.log(String(data))
        break
      }

      case 'table': {
        // 简单的表格输出
        if (Array.isArray(data)) {
          this.log(JSON.stringify(data, null, 2))
        } else if (typeof data === 'object' && data !== null) {
          this.log(JSON.stringify([data], null, 2))
        } else {
          this.log(String(data))
        }

        break
      }
    }
  }

  /**
   * 简单的 YAML 格式化
   */
  private toYaml(obj: unknown, indent = 0): string {
    const spaces = ' '.repeat(indent)
    let result = ''

    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          result += `${spaces}${key}:\n${this.toYaml(value, indent + 2)}`
        } else {
          result += `${spaces}${key}: ${value}\n`
        }
      }
    }

    return result
  }

  /**
   * 合并请求头
   */
  private mergeHeaders(headers?: Array<Record<string, string>>): Record<string, string> {
    if (!headers) return {}

    return headers.reduce((acc, header) => ({...acc, ...header}), {})
  }

  /**
   * 保存数据到文件
   */
  private async saveToFile(filePath: string, data: unknown): Promise<void> {
    const fs = await import('node:fs/promises')
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
  }
  // #endregion
}
