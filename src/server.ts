import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import type { Server } from "node:http"
import { createServer } from "node:http"
import { extname, join, normalize, relative } from "node:path"
import { CorePlayError } from "./util.js"

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
}

export async function serveForDemo(
  root: string,
  port: number,
  milliseconds: number,
): Promise<string> {
  const server = await startStaticServer(root, port)
  const address = server.address()
  const resolvedPort = typeof address === "object" && address !== null ? address.port : port
  const url = `http://localhost:${resolvedPort}/`
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error === undefined) {
        resolve()
        return
      }
      reject(new CorePlayError("Failed to close demo server", { cause: error }))
    })
  })
  return url
}

function startStaticServer(root: string, port: number): Promise<Server> {
  const server = createServer((request, response) => {
    const requestUrl = request.url ?? "/"
    const relativePath = requestUrl === "/" ? "index.html" : requestUrl.replace(/^\/+/, "")
    const normalized = normalize(relativePath)
    const target = join(root, normalized)
    if (relative(root, target).startsWith("..")) {
      response.writeHead(403)
      response.end("Forbidden")
      return
    }
    stat(target)
      .then((info) => {
        if (!info.isFile()) {
          response.writeHead(404)
          response.end("Not found")
          return
        }
        response.writeHead(200, { "content-type": MIME_TYPES[extname(target)] ?? "text/plain" })
        createReadStream(target).pipe(response)
      })
      .catch(() => {
        response.writeHead(404)
        response.end("Not found")
      })
  })
  return new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, () => {
      server.off("error", reject)
      resolve(server)
    })
  })
}
