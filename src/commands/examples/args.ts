import {Args, Command, Flags} from '@oclif/core'

/**
 * Args 示例命令
 * 
 * 这个命令展示了 oclif 中各种类型的 args（位置参数）的使用方法
 * Args 是命令行中的位置参数，不需要 -- 或 - 前缀
 * 
 * Args 和 Flags 的区别：
 * - Args: 位置参数，按顺序传递，如: command arg1 arg2
 * - Flags: 命名参数，使用 -- 或 - 前缀，如: command --flag1 value1
 * 
 * 运行示例：
 * oclifLearn examples:args create user 张三
 * oclifLearn examples:args delete post 123 --force
 */
export default class ArgsExample extends Command {
  static description = '演示 oclif 中各种类型的 args 用法'

  static examples = [
    '<%= config.bin %> <%= command.id %> create user 张三',
    '<%= config.bin %> <%= command.id %> delete post 123 --force',
    '<%= config.bin %> <%= command.id %> update article 456 "新标题"',
  ]

  static args = {
    // #region 必填参数
    // 第一个位置参数：操作类型
    action: Args.string({
      description: '要执行的操作 (create/update/delete)',
      required: true, // 必填参数
      options: ['create', 'update', 'delete'], // 限定可选值
    }),
    // #endregion

    // #region 可选参数
    // 第二个位置参数：资源类型
    resource: Args.string({
      description: '资源类型 (user/post/article)',
      required: true,
    }),
    // #endregion

    // #region 带默认值的参数
    // 第三个位置参数：资源 ID 或名称
    identifier: Args.string({
      description: '资源 ID 或名称',
      required: false, // 可选参数
      default: 'default', // 默认值
    }),
    // #endregion

    // #region 自定义解析参数
    // 第四个位置参数：额外数据
    data: Args.custom<Record<string, unknown>>({
      description: '额外数据（JSON 格式）',
      required: false,
      parse: async (input) => {
        try {
          // 尝试解析为 JSON
          return JSON.parse(input)
        } catch {
          // 如果不是 JSON，返回字符串对象
          return {value: input}
        }
      },
    })(),
    // #endregion
  }

  static flags = {
    // 添加一些 flags 来配合 args 使用
    force: Flags.boolean({
      char: 'f',
      description: '强制执行操作，跳过确认',
      default: false,
    }),

    verbose: Flags.boolean({
      char: 'v',
      description: '显示详细信息',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ArgsExample)

    // #region 输出解析结果
    this.log('\n=== Args 解析结果 ===\n')

    this.log(`操作: ${args.action}`)
    this.log(`资源类型: ${args.resource}`)
    this.log(`标识符: ${args.identifier}`)

    if (args.data) {
      this.log(`额外数据: ${JSON.stringify(args.data)}`)
    }

    this.log(`\n强制模式: ${flags.force ? '是' : '否'}`)
    this.log(`详细模式: ${flags.verbose ? '是' : '否'}`)
    // #endregion

    // #region 根据参数执行不同的逻辑
    this.log('\n=== 执行操作 ===\n')

    switch (args.action) {
      case 'create': {
        this.log(`正在创建 ${args.resource}: ${args.identifier}`)
        if (args.data) {
          this.log(`使用数据: ${JSON.stringify(args.data, null, 2)}`)
        }
        break
      }

      case 'update': {
        this.log(`正在更新 ${args.resource}: ${args.identifier}`)
        if (args.data) {
          this.log(`新数据: ${JSON.stringify(args.data, null, 2)}`)
        }
        break
      }

      case 'delete': {
        if (!flags.force) {
          this.log(`警告: 即将删除 ${args.resource}: ${args.identifier}`)
          this.log('提示: 使用 --force 标志跳过此警告')
        } else {
          this.log(`正在删除 ${args.resource}: ${args.identifier}`)
        }
        break
      }
    }
    // #endregion

    // #region 详细模式输出
    if (flags.verbose) {
      this.log('\n=== 详细信息 ===')
      this.log('所有参数:')
      this.log(JSON.stringify({args, flags}, null, 2))
    }
    // #endregion
  }
}
