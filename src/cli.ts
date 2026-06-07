#!/usr/bin/env node
import { z } from "zod"
import { runCorePlayPipeline } from "./pipeline.js"
import { CorePlayError } from "./util.js"

const CliArgsSchema = z.object({
  prompt: z.string().min(1),
  docsPath: z.string().min(1),
  outputPath: z.string().min(1),
  serve: z.boolean(),
})

type CliArgs = z.infer<typeof CliArgsSchema>

async function main(): Promise<void> {
  const args = CliArgsSchema.parse(parseArgs(process.argv.slice(2)))
  const result = await runCorePlayPipeline(args)
  console.log(`CorePlay Lab generated ${result.gameDesign.title}`)
  console.log(`Review page: ${result.reviewPagePath}`)
  console.log(`Prototype: ${result.prototypePath}`)
  console.log(`Score: ${result.finalScorecard.total}/35`)
}

function parseArgs(args: readonly string[]): CliArgs {
  const values = new Map<string, string>()
  let serve = true
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]
    if (token === "--no-serve") {
      serve = false
      continue
    }
    if (token === "--prompt" || token === "--docs" || token === "--out") {
      const value = args[index + 1]
      if (value === undefined) {
        throw new CorePlayError(`Missing value for ${token}`)
      }
      values.set(token, value)
      index += 1
    }
  }
  return {
    prompt: values.get("--prompt") ?? "Make a U.S.-popular hybrid-casual puzzle game",
    docsPath: values.get("--docs") ?? "./docs",
    outputPath: values.get("--out") ?? "./runs/demo",
    serve,
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message)
    process.exitCode = 1
    return
  }
  console.error("Unknown CorePlay failure")
  process.exitCode = 1
})
