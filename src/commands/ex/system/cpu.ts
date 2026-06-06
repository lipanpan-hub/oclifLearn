import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as os from 'node:os'

/**
 * CPU 信息命令
 * 
 * 显示 CPU 相关信息，包括核心数、型号、负载等
 * 
 * 运行示例：
 * oclifLearn ex system cpu
 * oclifLearn ex system cpu --json
 * oclifLearn ex system cpu --load
 */
export default class SystemCpu extends Command {
  static description = '显示 CPU 信息'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
    '<%= config.bin %> <%= command.id %> --load',
  ]
  static flags = {
    json: Flags.boolean({
      default: false,
      description: '以 JSON 格式输出',
    }),
    load: Flags.boolean({
      default: false,
      description: '显示 CPU 负载详情',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(SystemCpu)

    const cpus = os.cpus()
    const loadAvg = os.loadavg()

    const cpuInfo = {
      cores: cpus.length,
      loadAverage: {
        '1分钟': loadAvg[0],
        '5分钟': loadAvg[1],
        '15分钟': loadAvg[2],
      },
      model: cpus[0]?.model || '未知',
      speed: cpus[0]?.speed || 0,
    }

    if (flags.json) {
      this.log(JSON.stringify(cpuInfo, null, 2))
      return
    }

    this.log('\n=== CPU 信息 ===\n')

    this.log('【基本信息】')
    this.log(`  型号: ${cpuInfo.model}`)
    this.log(`  核心数: ${cpuInfo.cores}`)
    this.log(`  速度: ${cpuInfo.speed} MHz`)

    this.log('\n【系统负载】')
    this.log(`  1分钟: ${cpuInfo.loadAverage['1分钟'].toFixed(2)}`)
    this.log(`  5分钟: ${cpuInfo.loadAverage['5分钟'].toFixed(2)}`)
    this.log(`  15分钟: ${cpuInfo.loadAverage['15分钟'].toFixed(2)}`)

    if (flags.load && cpus.length > 0) {
      this.log('\n【各核心详情】')
      for (const [index, cpu] of cpus.entries()) {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
        const {idle} = cpu.times
        const usage = (((total - idle) / total) * 100).toFixed(1)
        this.log(`  核心 ${index}: ${cpu.model.split(' ')[0]} - 使用率 ${usage}%`)
      }
    }

    const cpuInfoPath = '/proc/cpuinfo'
    if (fs.existsSync(cpuInfoPath)) {
      this.log('\n【详细信息】(来自 /proc/cpuinfo)')
      try {
        const content = fs.readFileSync(cpuInfoPath, 'utf8')
        const lines = content.split('\n').slice(0, 20)
        for (const line of lines) {
          if (line.trim()) {
            this.log(`  ${line}`)
          }
        }
      } catch {
        this.log('  (无法读取)')
      }
    }

    this.log()
  }
}
