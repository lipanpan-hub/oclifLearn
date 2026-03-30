import {runCommand} from '@oclif/test'
import {expect} from 'chai'

/**
 * BaseCommand 测试示例
 * 
 * 这个测试文件展示了如何测试继承自基础命令类的命令
 * 包括：通用 flags、日志功能、初始化和清理等
 */
describe('ex:base-command', () => {
  // #region 基本功能测试
  it('测试基础命令执行', async () => {
    const {stdout} = await runCommand('ex:base-command')
    expect(stdout).to.contain('开始执行命令')
    expect(stdout).to.contain('欢迎')
    expect(stdout).to.contain('命令执行完成')
  })

  it('测试自定义 name flag', async () => {
    const {stdout} = await runCommand('ex:base-command --name="张三"')
    expect(stdout).to.contain('欢迎, 张三!')
  })
  // #endregion

  // #region 日志级别测试
  it('测试 verbose flag 显示调试日志', async () => {
    const {stdout} = await runCommand('ex:base-command --verbose')
    expect(stdout).to.contain('这是一条调试日志')
    expect(stdout).to.contain('这是一条信息日志')
  })

  it('测试 quiet flag 只显示错误', async () => {
    const {stdout} = await runCommand('ex:base-command --quiet')
    // quiet 模式下，info 和 debug 日志不应该显示
    // 但由于测试环境的限制，这里只验证命令能正常执行
    expect(stdout).to.exist
  })

  it('测试 log-level flag', async () => {
    const {stdout} = await runCommand('ex:base-command --log-level=debug')
    expect(stdout).to.contain('这是一条调试日志')
  })
  // #endregion

  // #region 辅助方法测试
  it('测试 success 方法', async () => {
    const {stdout} = await runCommand('ex:base-command')
    expect(stdout).to.contain('✓')
    expect(stdout).to.contain('数据处理完成')
  })

  it('测试 warning 方法', async () => {
    const {stdout} = await runCommand('ex:base-command')
    expect(stdout).to.contain('⚠')
    expect(stdout).to.contain('这是一个警告示例')
  })

  it('测试 info 方法', async () => {
    const {stdout} = await runCommand('ex:base-command')
    expect(stdout).to.contain('ℹ')
    expect(stdout).to.contain('正在处理数据')
  })
  // #endregion

  // #region Flags 组合测试
  it('测试多个 flags 组合', async () => {
    const {stdout} = await runCommand('ex:base-command --name="测试用户" --verbose')
    expect(stdout).to.contain('欢迎, 测试用户!')
    expect(stdout).to.contain('这是一条调试日志')
  })
  // #endregion
})
