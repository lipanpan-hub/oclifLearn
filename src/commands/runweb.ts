import { Args, Command } from '@oclif/core'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
// 兼容 dev 模式(src/commands) 和 build 模式(dist/commands)
const WEBDEMO_DIR = resolve(__dirname, '../webdemo').replace(/dist[/\\]webdemo/, 'src/webdemo')

export default class Runweb extends Command {
  static override description = '启动 webdemo 目录下的 React 前端项目'

  static override args = {
    project: Args.string({
      description: '要运行的项目名称 (webdemo 目录下的子文件夹名)',
      required: true,
    }),
  }

  static override examples = [
    '<%= config.bin %> runweb todolist',
    '<%= config.bin %> runweb videoPlayer',
  ]

  async run() {
    const { args } = await this.parse(Runweb)
    const projectDir = resolve(WEBDEMO_DIR, args.project)

    if (!existsSync(projectDir)) {
      this.error(`项目 "${args.project}" 不存在，可用项目: todolist, videoPlayer, xgplayer`)
    }

    const indexHtml = resolve(projectDir, 'index.html')
    if (!existsSync(indexHtml)) {
      this.error(`项目 "${args.project}" 缺少 index.html 入口文件`)
    }

    this.log(`🚀 启动项目: ${args.project}`)

    const server = await createServer({
      root: projectDir,
      plugins: [react()],
      server: { open: true },
    })

    await server.listen()
    server.printUrls()

    this.log('\n按 Ctrl+C 停止服务器')
  }
}
