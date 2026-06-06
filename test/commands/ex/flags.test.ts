import {runCommand} from '@oclif/test'
import {expect} from 'chai'

/**
 * Flags 命令测试示例
 * 
 * 这个测试文件展示了如何测试带有各种 flags 的命令
 * 包括：字符串、数字、布尔、选项、数组等类型的 flags
 */
describe('ex:flags', () => {
  // #region 基本 flags 测试
  it('测试必填的 name flag', async () => {
    const {stdout} = await runCommand('ex:flags --name="张三"')
    expect(stdout).to.contain('姓名: 张三')
  })

  it('测试短选项 -n', async () => {
    const {stdout} = await runCommand('ex:flags -n "李四"')
    expect(stdout).to.contain('姓名: 李四')
  })
  // #endregion

  // #region 数字类型 flag 测试
  it('测试 age flag 默认值', async () => {
    const {stdout} = await runCommand('ex:flags --name="王五"')
    expect(stdout).to.contain('年龄: 18')
  })

  it('测试自定义 age 值', async () => {
    const {stdout} = await runCommand('ex:flags --name="赵六" --age=25')
    expect(stdout).to.contain('年龄: 25')
  })
  // #endregion

  // #region 布尔类型 flag 测试
  it('测试 verbose flag', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试" --verbose')
    expect(stdout).to.contain('详细模式: 开启')
    expect(stdout).to.contain('详细信息')
  })

  it('测试 color flag 默认开启', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试"')
    expect(stdout).to.contain('彩色输出: 开启')
  })

  it('测试 --no-color 禁用彩色输出', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试" --no-color')
    expect(stdout).to.contain('彩色输出: 关闭')
  })
  // #endregion

  // #region 选项类型 flag 测试
  it('测试 format flag 默认值', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试"')
    expect(stdout).to.contain('输出格式: table')
  })

  it('测试 format flag 自定义值', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试" --format=json')
    expect(stdout).to.contain('输出格式: json')
  })
  // #endregion

  // #region 数组类型 flag 测试
  it('测试单个 tag', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试" --tags=tag1')
    expect(stdout).to.contain('标签: tag1')
  })

  it('测试多个 tags', async () => {
    const {stdout} = await runCommand('ex:flags --name="测试" --tags=tag1 --tags=tag2 --tags=tag3')
    expect(stdout).to.contain('标签: tag1, tag2, tag3')
  })
  // #endregion

  // #region 组合 flags 测试
  it('测试多个 flags 组合', async () => {
    const {stdout} = await runCommand(
      'ex:flags --name="张三" --age=30 --verbose --format=json --tags=dev --tags=test',
    )
    expect(stdout).to.contain('姓名: 张三')
    expect(stdout).to.contain('年龄: 30')
    expect(stdout).to.contain('详细模式: 开启')
    expect(stdout).to.contain('输出格式: json')
    expect(stdout).to.contain('标签: dev, test')
  })
  // #endregion

  // #region 错误情况测试
  it('缺少必填 flag 应该报错', async () => {
    try {
      await runCommand('ex:flags')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.match(/Missing required flag/)
    }
  })
  // #endregion
})
