import { mkdir, rm, appendFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'

export async function startTemporaryRestoreServer({ outputDir, repoRoot, stagePrefix }) {
  const dataDir = path.join(outputDir, `${stagePrefix}-restore-workspace-data`)
  const logPath = path.join(outputDir, `${stagePrefix}-restore-server.log`)
  await rm(dataDir, { force: true, recursive: true })
  await mkdir(dataDir, { recursive: true })
  const port = await findFreePort()
  const backendDir = path.join(repoRoot, 'backend')
  const pythonPath = path.join(backendDir, '.venv', 'bin', 'python')
  const child = spawn(
    pythonPath,
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        ACCESSIBLE_READER_DATA_DIR: dataDir,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  child.stdout?.on('data', (chunk) => {
    void appendFile(logPath, chunk).catch(() => undefined)
  })
  child.stderr?.on('data', (chunk) => {
    void appendFile(logPath, chunk).catch(() => undefined)
  })
  const baseUrl = `http://127.0.0.1:${port}`
  await waitForHealth(baseUrl, child, logPath)
  return {
    baseUrl,
    dataDir,
    logPath,
    async stop() {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
      await waitForExit(child, 5000).catch(() => {
        if (!child.killed) {
          child.kill('SIGKILL')
        }
      })
      await rm(dataDir, { force: true, recursive: true }).catch(() => undefined)
    },
  }
}

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close(() => {
        if (port) {
          resolve(port)
        } else {
          reject(new Error('Could not allocate a temporary restore server port.'))
        }
      })
    })
  })
}

async function waitForHealth(baseUrl, child, logPath) {
  let lastError = null
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Restore server exited early with code ${child.exitCode}. See ${logPath}.`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) {
        return
      }
      lastError = new Error(`Health returned ${response.status}.`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for temporary restore server at ${baseUrl}: ${lastError?.message ?? lastError}`)
}

async function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) {
    return
  }
  await Promise.race([
    new Promise((resolve) => {
      child.once('exit', resolve)
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out waiting for restore server exit.')), timeoutMs)),
  ])
}
