import {Command, Flags} from '@oclif/core'
import {confirm} from '@inquirer/prompts'
import * as path from 'node:path'
import {ConfigManager} from '../../lib/config-manager.js'

/**
 * Config 示例命令
 * 
 * 这个命令展示了两个方面：
 * 1. 如何使用自定义的配置管理器（ConfigManager）
 * 2. 如何访问 oclif 的 this.config 对象
 * 
 * this.config 是 oclif 提供的配置对象，包含了 CLI 应用的元数据和运行时信息
 * 
 * 运行示例：
 * oclifLearn examples:config --show
 * oclifLearn examples:config --set user.name="张三"
 * oclifLearn examples:config --set user.email="zhangsan@example.com"
 * oclifLearn examples:config --oclif-config
 */
export default class ConfigExample extends Command {
  static description = '演示配置管理功能'

  static examples = [
    '<%= config.bin %> <%= command.id %> --show',
    '<%= config.bin %> <%= command.id %> --set user.name="张三"',
    '<%= config.bin %> <%= command.id %> --set user.email="zhangsan@example.com"',
    '<%= config.bin %> <%= command.id %> --get user.name',
    '<%= config.bin %> <%= command.id %> --reset',
    '<%= config.bin %> <%= command.id %> --oclif-config',
  ]

  static flags = {
    // #region 显示 oclif 配置
    'oclif-config': Flags.boolean({
      description: '显示 oclif 的 this.config 对象信息',
      exclusive: ['show', 'set', 'get', 'reset'],
    }),
    // #endregion

    // #region 显示配置
    show: Flags.boolean({
      description: '显示当前配置',
      exclusive: ['set', 'get', 'reset', 'oclif-config'],
    }),
    // #endregion

    // #region 设置配置
    set: Flags.string({
      description: '设置配置项 (格式: key=value)',
      exclusive: ['show', 'get', 'reset', 'oclif-config'],
    }),
    // #endregion

    // #region 获取配置
    get: Flags.string({
      description: '获取配置项',
      exclusive: ['show', 'set', 'reset', 'oclif-config'],
    }),
    // #endregion

    // #region 重置配置
    reset: Flags.boolean({
      description: '重置为默认配置',
      exclusive: ['show', 'set', 'get', 'oclif-config'],
    }),
    // #endregion

    // #region 保存配置
    save: Flags.boolean({
      description: '保存配置到文件',
      default: false,
    }),
    // #endregion
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(ConfigExample)

    // #region 显示 oclif 配置对象
    if (flags['oclif-config']) {
      this.log('\n=== oclif this.config 对象信息 ===\n')
      this.log('this.config 是 oclif 提供的配置对象，包含 CLI 应用的元数据和运行时信息\n')

      // 基本信息
      this.log('【基本信息】')
      this.log(`  name: ${this.config.name}`)
      this.log(`  version: ${this.config.version}`)
      this.log(`  bin: ${this.config.bin}`)
      this.log(`  channel: ${this.config.channel}`)
      this.log(`  pjson.description: ${this.config.pjson.description}`)

      // 目录路径
      this.log('\n【目录路径】')
      this.log(`  root: ${this.config.root}`)
      this.log(`  configDir: ${this.config.configDir}`)
      this.log(`  cacheDir: ${this.config.cacheDir}`)
      this.log(`  dataDir: ${this.config.dataDir}`)

      // 运行环境
      this.log('\n【运行环境】')
      this.log(`  platform: ${this.config.platform}`)
      this.log(`  arch: ${this.config.arch}`)
      this.log(`  shell: ${this.config.shell}`)
      this.log(`  windows: ${this.config.windows}`)

      // 命令信息
      this.log('\n【命令信息】')
      this.log(`  commands 数量: ${this.config.commands.length}`)
      this.log('  可用命令列表:')
      for (const cmd of this.config.commands) {
        this.log(`    - ${cmd.id}: ${cmd.description || '(无描述)'}`)
      }

      // 主题和用户代理
      this.log('\n【其他信息】')
      this.log(`  theme: ${this.config.theme}`)
      this.log(`  userAgent: ${this.config.userAgent}`)
      this.log(`  npmRegistry: ${this.config.npmRegistry}`)

      // 插件信息
      this.log('\n【插件信息】')
      this.log(`  plugins 数量: ${this.config.plugins.size}`)
      for (const plugin of this.config.plugins.values()) {
        this.log(`    - ${plugin.name}@${plugin.version}`)
      }

      this.log('\n提示: 这些信息可以在命令中通过 this.config 访问')
      this.log('例如: this.config.configDir 可以获取配置目录路径\n')

      return
    }
    // #endregion

    // #region 初始化配置管理器
    // 使用 oclif 的配置目录
    const configDir = path.join(this.config.configDir)
    const configManager = new ConfigManager(configDir)
    // #endregion

    // #region 显示配置
    if (flags.show) {
      this.log('\n=== 当前配置 ===\n')
      const config = configManager.getConfig()
      this.log(JSON.stringify(config, null, 2))

      // 验证配置
      const validation = configManager.validate()
      if (!validation.valid) {
        this.log('\n配置验证失败:')
        for (const error of validation.errors) {
          this.warn(error)
        }
      }

      return
    }
    // #endregion

    // #region 设置配置
    if (flags.set) {
      const [key, value] = flags.set.split('=')
      if (!key || !value) {
        this.error('无效的格式，请使用: key=value')
      }

      this.log(`\n设置配置: ${key} = ${value}\n`)

      // 解析嵌套的键
      const keys = key.split('.')
      if (keys.length === 2) {
        const [section, field] = keys
        const config = configManager.getConfig()

        if (section in config) {
          const sectionConfig = config[section as keyof typeof config] as Record<string, unknown>
          if (field in sectionConfig) {
            // 尝试解析值的类型
            let parsedValue: unknown = value
            if (value === 'true') parsedValue = true
            else if (value === 'false') parsedValue = false
            else if (!Number.isNaN(Number(value))) parsedValue = Number(value)

            sectionConfig[field] = parsedValue

            if (flags.save) {
              configManager.saveConfig()
              this.log('配置已保存')
            } else {
              this.log('配置已更新（未保存到文件）')
              this.log('使用 --save 标志保存配置')
            }
          } else {
            this.error(`配置项 ${field} 不存在于 ${section} 中`)
          }
        } else {
          this.error(`配置节 ${section} 不存在`)
        }
      } else {
        this.error('配置键必须是两级格式: section.field')
      }

      return
    }
    // #endregion

    // #region 获取配置
    if (flags.get) {
      const keys = flags.get.split('.')
      if (keys.length === 2) {
        const [section, field] = keys
        const config = configManager.getConfig()

        if (section in config) {
          const sectionConfig = config[section as keyof typeof config] as Record<string, unknown>
          if (field in sectionConfig) {
            this.log(`\n${flags.get} = ${JSON.stringify(sectionConfig[field])}\n`)
          } else {
            this.error(`配置项 ${field} 不存在于 ${section} 中`)
          }
        } else {
          this.error(`配置节 ${section} 不存在`)
        }
      } else {
        this.error('配置键必须是两级格式: section.field')
      }

      return
    }
    // #endregion

    // #region 重置配置
    if (flags.reset) {
      const confirmed = await confirm({message: '确定要重置所有配置吗?'})
      if (confirmed) {
        configManager.reset()
        if (flags.save) {
          configManager.saveConfig()
          this.log('\n配置已重置并保存\n')
        } else {
          this.log('\n配置已重置（未保存到文件）\n')
        }
      } else {
        this.log('\n操作已取消\n')
      }

      return
    }
    // #endregion

    // #region 默认行为
    // 如果没有指定任何标志，显示帮助
    this.log('请指定操作标志，运行 --help 查看帮助')
    // #endregion
  }
}
