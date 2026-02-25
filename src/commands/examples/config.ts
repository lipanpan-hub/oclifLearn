import {Command, Flags} from '@oclif/core'
import {confirm} from '@inquirer/prompts'
import * as path from 'node:path'
import {ConfigManager} from '../../lib/config-manager.js'

/**
 * Config 示例命令
 * 
 * 这个命令展示了如何使用配置管理器
 * 演示配置的读取、写入、验证等操作
 * 
 * 运行示例：
 * oclifLearn examples:config --show
 * oclifLearn examples:config --set user.name="张三"
 * oclifLearn examples:config --set user.email="zhangsan@example.com"
 */
export default class ConfigExample extends Command {
  static description = '演示配置管理功能'

  static examples = [
    '<%= config.bin %> <%= command.id %> --show',
    '<%= config.bin %> <%= command.id %> --set user.name="张三"',
    '<%= config.bin %> <%= command.id %> --set user.email="zhangsan@example.com"',
    '<%= config.bin %> <%= command.id %> --get user.name',
    '<%= config.bin %> <%= command.id %> --reset',
  ]

  static flags = {
    // #region 显示配置
    show: Flags.boolean({
      description: '显示当前配置',
      exclusive: ['set', 'get', 'reset'],
    }),
    // #endregion

    // #region 设置配置
    set: Flags.string({
      description: '设置配置项 (格式: key=value)',
      exclusive: ['show', 'get', 'reset'],
    }),
    // #endregion

    // #region 获取配置
    get: Flags.string({
      description: '获取配置项',
      exclusive: ['show', 'set', 'reset'],
    }),
    // #endregion

    // #region 重置配置
    reset: Flags.boolean({
      description: '重置为默认配置',
      exclusive: ['show', 'set', 'get'],
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
