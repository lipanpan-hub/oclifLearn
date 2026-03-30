import {runCommand} from '@oclif/test'
import {expect} from 'chai'

/**
 * Errors 命令测试示例
 * 
 * 这个测试文件展示了如何测试命令的错误处理
 * 包括：CLI 错误、验证错误、警告、自定义退出码等
 */
describe('ex:errors', () => {
  // #region CLI 错误测试
  it('测试 CLI 错误', async () => {
    try {
      await runCommand('ex:errors --type=cli')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.contain('这是一个 CLI 错误示例')
    }
  })
  // #endregion

  // #region 验证错误测试
  it('测试验证错误', async () => {
    try {
      await runCommand('ex:errors --type=validation')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.contain('验证失败')
      expect((error as Error).message).to.contain('用户名不能为空')
    }
  })
  // #endregion

  // #region 警告测试
  it('测试警告不会中断程序', async () => {
    const {stdout, stderr} = await runCommand('ex:errors --type=warning')
    // 警告信息通常输出到 stderr
    expect(stderr).to.contain('这是一个警告')
    // 程序继续执行
    expect(stdout).to.contain('程序继续执行')
  })
  // #endregion

  // #region 自定义退出码测试
  it('测试默认退出码', async () => {
    try {
      await runCommand('ex:errors --type=exit')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.contain('退出码: 1')
    }
  })

  it('测试自定义退出码', async () => {
    try {
      await runCommand('ex:errors --type=exit --code=42')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.contain('退出码: 42')
    }
  })
  // #endregion

  // #region 自定义错误类测试
  it('测试自定义错误类', async () => {
    try {
      await runCommand('ex:errors --type=custom')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.contain('这是一个自定义错误')
    }
  })
  // #endregion

  // #region 错误捕获测试
  it('测试错误被 catch 方法捕获', async () => {
    try {
      await runCommand('ex:errors --type=cli')
      expect.fail('应该抛出错误')
    } catch (error) {
      // catch 方法会记录错误信息，但最终还是会抛出错误
      expect((error as Error).message).to.contain('这是一个 CLI 错误示例')
    }
  })
  // #endregion
})
