import {runCommand} from '@oclif/test'
import {expect} from 'chai'

/**
 * Args 命令测试示例
 * 
 * 这个测试文件展示了如何测试带有位置参数（args）的命令
 * Args 是按顺序传递的参数，不需要 -- 前缀
 */
describe('ex:args', () => {
  // #region 基本 args 测试
  it('测试 create 操作', async () => {
    const {stdout} = await runCommand('ex:args create user 张三')
    expect(stdout).to.contain('操作: create')
    expect(stdout).to.contain('资源类型: user')
    expect(stdout).to.contain('标识符: 张三')
    expect(stdout).to.contain('正在创建 user: 张三')
  })

  it('测试 update 操作', async () => {
    const {stdout} = await runCommand('ex:args update post 123')
    expect(stdout).to.contain('操作: update')
    expect(stdout).to.contain('资源类型: post')
    expect(stdout).to.contain('标识符: 123')
    expect(stdout).to.contain('正在更新 post: 123')
  })

  it('测试 delete 操作', async () => {
    const {stdout} = await runCommand('ex:args delete article 456')
    expect(stdout).to.contain('操作: delete')
    expect(stdout).to.contain('资源类型: article')
    expect(stdout).to.contain('标识符: 456')
    expect(stdout).to.contain('即将删除 article: 456')
  })
  // #endregion

  // #region 默认值测试
  it('测试 identifier 默认值', async () => {
    const {stdout} = await runCommand('ex:args create user')
    expect(stdout).to.contain('标识符: default')
  })
  // #endregion

  // #region Args 和 Flags 组合测试
  it('测试 delete 操作带 --force flag', async () => {
    const {stdout} = await runCommand('ex:args delete user test-user --force')
    expect(stdout).to.contain('正在删除 user: test-user')
    expect(stdout).to.contain('强制模式: 是')
  })

  it('测试 --verbose flag', async () => {
    const {stdout} = await runCommand('ex:args create post "新文章" --verbose')
    expect(stdout).to.contain('详细模式: 是')
    expect(stdout).to.contain('详细信息')
    expect(stdout).to.contain('"action": "create"')
  })
  // #endregion

  // #region JSON 数据参数测试
  it('测试 JSON 格式的 data 参数', async () => {
    const {stdout} = await runCommand('ex:args create user admin \'{"role":"admin","email":"admin@test.com"}\'')
    expect(stdout).to.contain('额外数据:')
    expect(stdout).to.contain('role')
    expect(stdout).to.contain('admin')
  })

  it('测试非 JSON 格式的 data 参数', async () => {
    const {stdout} = await runCommand('ex:args create user test "some-data"')
    expect(stdout).to.contain('额外数据:')
    expect(stdout).to.contain('value')
  })
  // #endregion

  // #region 错误情况测试
  it('缺少必填 args 应该报错', async () => {
    try {
      await runCommand('ex:args')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.match(/Missing \d+ required arg/)
    }
  })

  it('无效的 action 值应该报错', async () => {
    try {
      await runCommand('ex:args invalid user test')
      expect.fail('应该抛出错误')
    } catch (error) {
      expect((error as Error).message).to.match(/Expected --action=/)
    }
  })
  // #endregion
})
