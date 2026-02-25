/**
 * 配置管理器
 * 
 * 这个模块展示了如何在 oclif 项目中管理配置
 * 包括读取、写入、验证配置文件等功能
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// #region 配置接口定义
/**
 * 应用配置接口
 */
export interface AppConfig {
  // 用户信息
  user: {
    name: string
    email: string
  }
  // API 配置
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  // 功能开关
  features: {
    enableLogging: boolean
    enableCache: boolean
  }
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AppConfig = {
  user: {
    name: '',
    email: '',
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  },
  features: {
    enableLogging: true,
    enableCache: true,
  },
}
// #endregion

// #region 配置管理器类
/**
 * 配置管理器类
 * 负责配置的读取、写入、验证等操作
 */
export class ConfigManager {
  private configPath: string
  private config: AppConfig

  constructor(configDir: string) {
    // 配置文件路径
    this.configPath = path.join(configDir, 'config.json')
    // 初始化配置
    this.config = this.loadConfig()
  }

  /**
   * 加载配置文件
   * 如果文件不存在，返回默认配置
   */
  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8')
        const loadedConfig = JSON.parse(content) as Partial<AppConfig>
        // 合并默认配置和加载的配置
        return this.mergeConfig(DEFAULT_CONFIG, loadedConfig)
      }
    } catch (error) {
      console.warn(`加载配置文件失败: ${error}`)
    }

    return {...DEFAULT_CONFIG}
  }

  /**
   * 保存配置到文件
   */
  saveConfig(): void {
    try {
      // 确保目录存在
      const dir = path.dirname(this.configPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
      }

      // 写入配置文件
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8')
    } catch (error) {
      throw new Error(`保存配置文件失败: ${error}`)
    }
  }

  /**
   * 获取完整配置
   */
  getConfig(): AppConfig {
    return {...this.config}
  }

  /**
   * 获取配置项
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  /**
   * 设置配置项
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
  }

  /**
   * 更新用户信息
   */
  updateUser(user: Partial<AppConfig['user']>): void {
    this.config.user = {...this.config.user, ...user}
  }

  /**
   * 更新 API 配置
   */
  updateApi(api: Partial<AppConfig['api']>): void {
    this.config.api = {...this.config.api, ...api}
  }

  /**
   * 更新功能开关
   */
  updateFeatures(features: Partial<AppConfig['features']>): void {
    this.config.features = {...this.config.features, ...features}
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = {...DEFAULT_CONFIG}
  }

  /**
   * 验证配置
   */
  validate(): {valid: boolean; errors: string[]} {
    const errors: string[] = []

    // 验证用户邮箱格式
    if (this.config.user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.config.user.email)) {
        errors.push('无效的邮箱地址')
      }
    }

    // 验证 API 超时时间
    if (this.config.api.timeout < 0) {
      errors.push('API 超时时间不能为负数')
    }

    // 验证重试次数
    if (this.config.api.retries < 0) {
      errors.push('重试次数不能为负数')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 合并配置对象
   */
  private mergeConfig(defaultConfig: AppConfig, loadedConfig: Partial<AppConfig>): AppConfig {
    return {
      user: {...defaultConfig.user, ...loadedConfig.user},
      api: {...defaultConfig.api, ...loadedConfig.api},
      features: {...defaultConfig.features, ...loadedConfig.features},
    }
  }
}
// #endregion
