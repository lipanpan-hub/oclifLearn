import {Command, Flags} from '@oclif/core'

/**
 * Flags 示例命令
 * 
 * 这个命令展示了 oclif 中各种类型的 flags（标志/选项）的使用方法
 * Flags 是命令行参数，通常以 -- 或 - 开头
 * 
 * 运行示例：
 * oclifLearn examples:flags --name="张三" --age=25 --verbose --tags=tag1 --tags=tag2
 */
export default class FlagsExample extends Command {
  static description = '演示 oclif 中各种类型的 flags 用法'

  static examples = [
    '<%= config.bin %> <%= command.id %> --name="张三" --age=25',
    '<%= config.bin %> <%= command.id %> -n "李四" -a 30 --verbose',
    '<%= config.bin %> <%= command.id %> --tags=tag1 --tags=tag2 --tags=tag3',
  ]

  static flags = {
    // #region 字符串类型 Flag
    // 最基本的字符串类型 flag
    name: Flags.string({
      char: 'n', // 短选项，可以用 -n 代替 --name
      description: '用户名称',
      required: true, // 必填项
    }),
    // #endregion

    // #region 数字类型 Flag
    // 整数类型 flag
    age: Flags.integer({
      char: 'a',
      description: '用户年龄',
      default: 18, // 默认值
      min: 0, // 最小值
      max: 150, // 最大值
    }),
    // #endregion

    // #region 布尔类型 Flag
    // 布尔类型 flag，不需要传值，存在即为 true
    verbose: Flags.boolean({
      char: 'v',
      description: '是否显示详细信息',
      default: false,
    }),

    // 布尔类型 flag，可以通过 --no-color 来设置为 false
    color: Flags.boolean({
      description: '是否使用彩色输出',
      default: true,
      allowNo: true, // 允许使用 --no-color 来禁用
    }),
    // #endregion

    // #region 选项类型 Flag
    // 限定可选值的 flag
    format: Flags.option({
      char: 'f',
      description: '输出格式',
      options: ['json', 'yaml', 'table'] as const, // 限定只能是这三个值之一
      default: 'table',
    })(),
    // #endregion

    // #region 数组类型 Flag
    // 可以多次指定的 flag，会收集成数组
    tags: Flags.string({
      char: 't',
      description: '标签列表（可多次指定）',
      multiple: true, // 允许多次指定
    }),
    // #endregion

    // #region 文件路径 Flag
    // 文件路径类型 flag
    config: Flags.file({
      char: 'c',
      description: '配置文件路径',
      exists: true, // 验证文件必须存在
    }),
    // #endregion

    // #region 目录路径 Flag
    // 目录路径类型 flag
    output: Flags.directory({
      char: 'o',
      description: '输出目录路径',
    }),
    // #endregion

    // #region URL 类型 Flag
    // URL 类型 flag
    url: Flags.url({
      char: 'u',
      description: 'API 端点 URL',
    }),
    // #endregion

    // #region 自定义解析 Flag
    // 使用自定义解析函数的 flag
    email: Flags.custom<string>({
      char: 'e',
      description: '电子邮件地址',
      parse: async (input) => {
        // 自定义验证逻辑
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input)) {
          throw new Error(`无效的邮箱地址: ${input}`)
        }
        return input.toLowerCase() // 转换为小写
      },
    })(),
    // #endregion

    // #region 依赖关系 Flag
    // 依赖其他 flag 的 flag
    password: Flags.string({
      char: 'p',
      description: '密码（需要同时提供 email）',
      dependsOn: ['email'], // 只有提供了 email 才能使用 password
    }),
    // #endregion

    // #region 互斥 Flag
    // 与其他 flag 互斥的 flag
    json: Flags.boolean({
      description: '以 JSON 格式输出',
      exclusive: ['yaml'], // 不能与 yaml 同时使用
    }),

    yaml: Flags.boolean({
      description: '以 YAML 格式输出',
      exclusive: ['json'], // 不能与 json 同时使用
    }),
    // #endregion
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(FlagsExample)

    // #region 输出解析结果
    this.log('\n=== Flags 解析结果 ===\n')

    this.log(`姓名: ${flags.name}`)
    this.log(`年龄: ${flags.age}`)
    this.log(`详细模式: ${flags.verbose ? '开启' : '关闭'}`)
    this.log(`彩色输出: ${flags.color ? '开启' : '关闭'}`)
    this.log(`输出格式: ${flags.format}`)

    if (flags.tags && flags.tags.length > 0) {
      this.log(`标签: ${flags.tags.join(', ')}`)
    }

    if (flags.config) {
      this.log(`配置文件: ${flags.config}`)
    }

    if (flags.output) {
      this.log(`输出目录: ${flags.output}`)
    }

    if (flags.url) {
      this.log(`URL: ${flags.url}`)
    }

    if (flags.email) {
      this.log(`邮箱: ${flags.email}`)
    }

    if (flags.password) {
      this.log(`密码: ${'*'.repeat(flags.password.length)}`)
    }

    if (flags.json) {
      this.log('\n以 JSON 格式输出')
    } else if (flags.yaml) {
      this.log('\n以 YAML 格式输出')
    }

    // 详细模式下显示更多信息
    if (flags.verbose) {
      this.log('\n=== 详细信息 ===')
      this.log(JSON.stringify(flags, null, 2))
    }
    // #endregion
  }
}
