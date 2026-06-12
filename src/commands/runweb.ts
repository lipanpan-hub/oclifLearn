import { Args, Command } from '@oclif/core'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { search } from '@inquirer/prompts'
import Fuse from 'fuse.js'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
// 兼容 dev 模式(src/commands) 和 build 模式(dist/commands)
const WEBDEMO_DIR = resolve(__dirname, '../webdemo').replace(/dist[/\\]webdemo/, 'src/webdemo')

export default class Runweb extends Command {
  static override description = '启动 webdemo 目录下的前端项目 (支持 React / Vue)'

  static override args = {
    project: Args.string({
      description: '要运行的项目名称 (webdemo 目录下的子文件夹名)，不提供则交互式选择',
      required: false,
    }),
  }

  static override examples = [
    '<%= config.bin %> runweb',
    '<%= config.bin %> runweb todolist',
    '<%= config.bin %> runweb videoPlayer',
  ]

  // 扫描 webdemo 目录，返回所有包含 index.html 的子项目名称
  private scanProjects(): string[] {
    return readdirSync(WEBDEMO_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(resolve(WEBDEMO_DIR, entry.name, 'index.html')))
      .map((entry) => entry.name)
  }

  // 使用 fuse.js 模糊匹配 + inquirer search 交互式选择项目
  private async selectProject(projects: string[]): Promise<string> {
    const fuse = new Fuse(projects, { threshold: 0.4 })
    return search<string>({
      message: '请选择要运行的项目 (可输入关键字模糊搜索)',
      source: (term) => {
        if (!term) return projects.map((name) => ({ name, value: name }))
        return fuse.search(term).map(({ item }) => ({ name: item, value: item }))
      },
    })
  }

  async run() {
    const { args } = await this.parse(Runweb)

    let project = args.project
    if (!project) {
      const projects = this.scanProjects()
      if (projects.length === 0) {
        this.error(`webdemo 目录下没有找到任何可运行的项目`)
      }

      project = await this.selectProject(projects)
    }

    const projectDir = resolve(WEBDEMO_DIR, project)

    if (!existsSync(projectDir)) {
      this.error(`项目 "${project}" 不存在，可用项目: ${this.scanProjects().join(', ')}`)
    }

    const indexHtml = resolve(projectDir, 'index.html')
    if (!existsSync(indexHtml)) {
      this.error(`项目 "${project}" 缺少 index.html 入口文件`)
    }

    this.log(`🚀 启动项目: ${project}`)

    const server = await createServer({
      root: projectDir,
      plugins: [react(), vue()],
      server: { open: true },
    })

    await server.listen()
    server.printUrls()

    this.log('\n按 Ctrl+C 停止服务器')
  }
}
