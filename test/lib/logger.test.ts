import {expect} from 'chai'
import {Logger, LogLevel} from '../../src/lib/logger.js'

/**
 * Logger 测试示例
 * 
 * 这个测试文件展示了如何测试自定义的工具类
 * 包括：单元测试、配置测试、方法测试等
 */
describe('Logger', () => {
  // #region 基本功能测试
  it('应该创建 Logger 实例', () => {
    const logger = new Logger()
    expect(logger).to.be.instanceOf(Logger)
  })

  it('应该使用默认配置', () => {
    const logger = new Logger()
    // 验证 logger 对象存在且可用
    expect(logger).to.have.property('info')
    expect(logger).to.have.property('error')
    expect(logger).to.have.property('warn')
    expect(logger).to.have.property('debug')
  })
  // #endregion

  // #region 日志级别测试
  it('应该支持不同的日志级别', () => {
    const logger = new Logger({level: LogLevel.DEBUG})
    expect(logger).to.exist

    const logger2 = new Logger({level: LogLevel.INFO})
    expect(logger2).to.exist

    const logger3 = new Logger({level: LogLevel.WARN})
    expect(logger3).to.exist

    const logger4 = new Logger({level: LogLevel.ERROR})
    expect(logger4).to.exist
  })
  // #endregion

  // #region 配置选项测试
  it('应该支持自定义配置', () => {
    const logger = new Logger({
      level: LogLevel.DEBUG,
      console: true,
      file: false,
      timestamp: true,
      color: true,
    })
    expect(logger).to.exist
  })

  it('应该支持禁用控制台输出', () => {
    const logger = new Logger({
      console: false,
    })
    expect(logger).to.exist
  })
  // #endregion

  // #region 方法存在性测试
  it('应该有 info 方法', () => {
    const logger = new Logger()
    expect(logger.info).to.be.a('function')
  })

  it('应该有 error 方法', () => {
    const logger = new Logger()
    expect(logger.error).to.be.a('function')
  })

  it('应该有 warn 方法', () => {
    const logger = new Logger()
    expect(logger.warn).to.be.a('function')
  })

  it('应该有 debug 方法', () => {
    const logger = new Logger()
    expect(logger.debug).to.be.a('function')
  })

  it('应该有 close 方法', () => {
    const logger = new Logger()
    expect(logger.close).to.be.a('function')
  })
  // #endregion

  // #region 日志方法调用测试
  it('应该能调用 info 方法而不报错', () => {
    const logger = new Logger()
    expect(() => logger.info('测试信息')).to.not.throw()
  })

  it('应该能调用 error 方法而不报错', () => {
    const logger = new Logger()
    expect(() => logger.error('测试错误')).to.not.throw()
  })

  it('应该能调用 warn 方法而不报错', () => {
    const logger = new Logger()
    expect(() => logger.warn('测试警告')).to.not.throw()
  })

  it('应该能调用 debug 方法而不报错', () => {
    const logger = new Logger()
    expect(() => logger.debug('测试调试')).to.not.throw()
  })
  // #endregion

  // #region 清理测试
  it('应该能正常关闭', () => {
    const logger = new Logger()
    expect(() => logger.close()).to.not.throw()
  })
  // #endregion
})
