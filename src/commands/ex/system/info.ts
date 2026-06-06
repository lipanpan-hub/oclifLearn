import {Command, Flags} from '@oclif/core'
import * as os from 'node:os'

/**
 * 系统信息命令
 * 
 * 显示系统的基本信息，包括操作系统、主机、用户等
 * 
 * 运行示例：
 * oclifLearn ex system info
 * oclifLearn ex system info --json
 */
export default class SystemInfo extends Command {
  static description = '显示系统基本信息'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ]
  static flags = {
    json: Flags.boolean({
      default: false,
      description: '以 JSON 格式输出',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(SystemInfo)

    const info = {
      arch: os.arch(),
      endianness: os.endianness(),
      homedir: os.homedir(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      tmpdir: os.tmpdir(),
      type: os.type(),
      uptime: this.formatUptime(os.uptime()),
      userInfo: os.userInfo(),
    }

    if (flags.json) {
      this.log(JSON.stringify(info, null, 2))
      return
    }

    this.log('\n=== 系统基本信息 ===\n')

    this.log('【操作系统】')
    this.log(`  平台: ${info.platform}`)
    this.log(`  类型: ${info.type}`)
    this.log(`  版本: ${info.release}`)
    this.log(`  架构: ${info.arch}`)

    this.log('\n【主机信息】')
    this.log(`  主机名: ${info.hostname}`)
    this.log(`  系统运行时间: ${info.uptime}`)

    this.log('\n【用户信息】')
    this.log(`  用户名: ${info.userInfo.username}`)
    this.log(`  主目录: ${info.homedir}`)
    this.log(`  Shell: ${info.userInfo.shell || '(默认)'}`)

    this.log('\n【其他】')
    this.log(`  临时目录: ${info.tmpdir}`)
    this.log(`  字节序: ${info.endianness}`)
    this.log()
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86_400)
    const hours = Math.floor((seconds % 86_400) / 3_600)
    const minutes = Math.floor((seconds % 3_600) / 60)

    const parts: string[] = []
    if (days > 0) parts.push(`${days}天`)
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)

    return parts.join(' ') || '不到1分钟'
  }
}
