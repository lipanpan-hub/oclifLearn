import {Command, Flags} from '@oclif/core'
import * as os from 'node:os'

/**
 * 内存信息命令
 * 
 * 显示系统内存信息，包括总内存、可用内存、使用率等
 * 
 * 运行示例：
 * oclifLearn ex system memory
 * oclifLearn ex system memory --json
 * oclifLearn ex system memory --watch
 */
export default class SystemMemory extends Command {
  static description = '显示内存信息'
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
    const {flags} = await this.parse(SystemMemory)

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const usagePercent = ((usedMem / totalMem) * 100).toFixed(1)

    const memoryInfo = {
      free: this.formatBytes(freeMem),
      freeBytes: freeMem,
      total: this.formatBytes(totalMem),
      totalBytes: totalMem,
      usagePercent: `${usagePercent}%`,
      used: this.formatBytes(usedMem),
      usedBytes: usedMem,
    }

    if (flags.json) {
      this.log(JSON.stringify(memoryInfo, null, 2))
      return
    }

    this.log('\n=== 内存信息 ===\n')

    this.log('【系统内存】')
    this.log(`  总内存: ${memoryInfo.total}`)
    this.log(`  已使用: ${memoryInfo.used}`)
    this.log(`  可用: ${memoryInfo.free}`)
    this.log(`  使用率: ${memoryInfo.usagePercent}`)

    const barLength = 30
    const usedBars = Math.round((Number(usagePercent) / 100) * barLength)
    const freeBars = barLength - usedBars
    const bar = `[${'█'.repeat(usedBars)}${'░'.repeat(freeBars)}]`
    this.log(`  ${bar}`)

    this.log()
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let unitIndex = 0
    let value = bytes

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`
  }
}
