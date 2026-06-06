import {expect} from 'chai'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {ConfigManager} from '../../src/lib/config-manager.js'

/**
 * ConfigManager 测试示例
 * 
 * 这个测试文件展示了如何测试涉及文件系统的类
 * 包括：临时目录、文件操作、配置管理等
 */
describe('ConfigManager', () => {
  let tempDir: string
  let configManager: ConfigManager

  // #region 测试前后的设置和清理
  // beforeEach 在每个测试用例执行前运行
  beforeEach(() => {
    // 创建临时目录用于测试
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'))
    configManager = new ConfigManager(tempDir)
  })

  // afterEach 在每个测试用例执行后运行
  afterEach(() => {
    // 清理临时目录
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, {recursive: true, force: true})
    }
  })
  // #endregion

  // #region 基本功能测试
  it('应该创建 ConfigManager 实例', () => {
    expect(configManager).to.be.instanceOf(ConfigManager)
  })

  it('应该返回默认配置', () => {
    const config = configManager.getConfig()
    expect(config).to.be.an('object')
    expect(config).to.have.property('user')
    expect(config).to.have.property('api')
  })
  // #endregion

  // #region 配置验证测试
  it('应该验证配置', () => {
    const validation = configManager.validate()
    expect(validation).to.have.property('valid')
    expect(validation).to.have.property('errors')
    expect(validation.valid).to.be.a('boolean')
    expect(validation.errors).to.be.an('array')
  })

  it('默认配置应该是有效的', () => {
    const validation = configManager.validate()
    expect(validation.valid).to.be.true
    expect(validation.errors).to.be.empty
  })
  // #endregion

  // #region 配置保存和加载测试
  it('应该能保存配置到文件', () => {
    configManager.saveConfig()
    const configFile = path.join(tempDir, 'config.json')
    expect(fs.existsSync(configFile)).to.be.true
  })

  it('应该能从文件加载配置', () => {
    // 先保存配置
    configManager.saveConfig()
    
    // 创建新的 ConfigManager 实例来加载配置
    const newConfigManager = new ConfigManager(tempDir)
    const config = newConfigManager.getConfig()
    
    expect(config).to.be.an('object')
    expect(config).to.have.property('user')
  })
  // #endregion

  // #region 配置重置测试
  it('应该能重置配置', () => {
    // 修改配置
    const config = configManager.getConfig()
    config.user.name = '测试用户'
    
    // 重置配置
    configManager.reset()
    
    // 验证配置已重置
    const resetConfig = configManager.getConfig()
    expect(resetConfig.user.name).to.not.equal('测试用户')
  })
  // #endregion

  // #region 配置修改测试
  it('应该能修改配置', () => {
    const config = configManager.getConfig()
    const originalName = config.user.name
    
    // 修改配置
    config.user.name = '新用户名'
    
    // 验证修改
    expect(config.user.name).to.equal('新用户名')
    expect(config.user.name).to.not.equal(originalName)
  })

  it('修改后的配置应该能保存', () => {
    const config = configManager.getConfig()
    config.user.name = '保存测试'
    
    // 保存配置
    configManager.saveConfig()
    
    // 重新加载验证
    const newConfigManager = new ConfigManager(tempDir)
    const loadedConfig = newConfigManager.getConfig()
    
    expect(loadedConfig.user.name).to.equal('保存测试')
  })
  // #endregion

  // #region 错误处理测试
  it('应该处理不存在的配置目录', () => {
    const nonExistentDir = path.join(tempDir, 'non-existent')
    expect(() => new ConfigManager(nonExistentDir)).to.not.throw()
  })
  // #endregion
})
