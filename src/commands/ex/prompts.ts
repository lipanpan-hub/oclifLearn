import {Command, Flags} from '@oclif/core'
import {confirm, input} from '@inquirer/prompts'

/**
 * Prompts 示例命令
 * 
 * 这个命令展示了 oclif 中用户交互提示的使用方法
 * 使用 ux 模块提供的各种交互式提示功能
 * 
 * 运行示例：
 * oclifLearn examples:prompts
 * oclifLearn examples:prompts --skip-prompts
 */
export default class PromptsExample extends Command {
  static description = '演示 oclif 中各种用户交互提示的用法'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --skipPrompts',
  ]

  static flags = {
    skipPrompts: Flags.boolean({
      description: '跳过所有交互提示，使用默认值',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(PromptsExample)

    this.log('=== oclif 用户交互提示示例 ===\n')

    if (flags.skipPrompts) {
      this.log('跳过交互提示模式\n')
      return
    }

    // #region 简单文本输入
    // 最基本的文本输入提示
    const name = await input({message: '请输入您的姓名'})
    this.log(`您好, ${name}!\n`)
    // #endregion

    // #region 带默认值的输入
    // 提供默认值的输入提示
    const city = await input({message: '请输入您的城市', default: '北京'})
    this.log(`您来自: ${city}\n`)
    // #endregion

    // #region 密码输入
    // 隐藏输入内容的密码提示
    const password = await input({message: '请输入密码', transformer: () => '***'})
    this.log(`密码长度: ${password.length} 个字符\n`)
    // #endregion

    // #region 确认提示
    // 是/否确认提示
    const confirmed = await confirm({message: '是否继续?'})
    if (!confirmed) {
      this.log('操作已取消')
      return
    }

    this.log('继续执行...\n')
    // #endregion

    // #region 必填输入
    // 不允许为空的输入
    const email = await input({
      message: '请输入邮箱地址（必填）',
      validate: (value) => (value.length > 0 ? true : '邮箱地址不能为空'),
    })
    this.log(`邮箱: ${email}\n`)
    // #endregion

    // #region 进度条
    // 显示进度条
    this.log('开始处理任务...')
    this.log('正在处理: 初始化')

    // 模拟耗时操作
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.log('正在处理: 处理中...')

    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.log('正在处理: 即将完成...')

    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.log('完成!\n')
    // #endregion

    // #region 表格输出
    // 以表格形式展示数据
    this.log('用户信息汇总:')
    const users = [
      {name, city, email, status: '活跃'},
      {name: '示例用户', city: '上海', email: 'example@test.com', status: '离线'},
    ]

    // 简单的表格输出
    this.log('姓名\t\t城市\t\t邮箱\t\t\t状态')
    this.log('─'.repeat(60))
    for (const user of users) {
      this.log(`${user.name}\t\t${user.city}\t\t${user.email}\t${user.status}`)
    }

    this.log('')
    // #endregion

    // #region URL 提示
    // 显示可点击的 URL
    this.log('更多信息请访问:')
    this.log('oclif 官方文档: https://oclif.io')
    this.log('')
    // #endregion

    // #region 等待提示
    // 显示等待动画
    this.log('正在连接服务器...')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    this.log('连接成功!\n')
    // #endregion

    this.log('=== 所有交互完成 ===')
  }
}
