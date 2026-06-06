import {Command, Flags} from '@oclif/core'

/**
 * 环境变量命令
 * 
 * 显示系统环境变量
 * 
 * 运行示例：
 * oclifLearn ex system env
 * oclifLearn ex system env --filter PATH
 * oclifLearn ex system env --filter NODE
 */
export default class SystemEnv extends Command {
  static description = '显示环境变量'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --filter PATH',
    '<%= config.bin %> <%= command.id %> --filter NODE',
  ]
  static flags = {
    filter: Flags.string({
      char: 'f',
      description: '过滤环境变量名（支持模糊匹配）',
    }),
    json: Flags.boolean({
      default: false,
      description: '以 JSON 格式输出',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(SystemEnv)

    let envVars = {...process.env}

    if (flags.filter) {
      const filter = flags.filter.toUpperCase()
      envVars = Object.fromEntries(
        Object.entries(envVars).filter(([key]) => key.toUpperCase().includes(filter)),
      )
    }

    if (flags.json) {
      this.log(JSON.stringify(envVars, null, 2))
      return
    }

    this.log('\n=== 环境变量 ===\n')

    if (flags.filter) {
      this.log(`过滤条件: ${flags.filter}`)
      this.log()
    }

    const sortedKeys = Object.keys(envVars).sort()

    if (sortedKeys.length === 0) {
      this.log('没有匹配的环境变量')
      this.log()
      return
    }

    for (const key of sortedKeys) {
      const value = envVars[key] as string
      if (value.length > 100) {
        this.log(`${key}:`)
        this.log(`  ${value.slice(0, 100)}...`)
      } else {
        this.log(`${key}: ${value}`)
      }
    }

    this.log()
    this.log(`共 ${sortedKeys.length} 个环境变量`)
    this.log()
  }
}
