#!/usr/bin/env node
/**
 * Runs the backend (:3000) and frontend (:8443) together with prefixed output.
 * Ctrl+C stops both; if either exits, the other is torn down too.
 */
import { spawn, execSync } from "node:child_process";
import path from "node:path";

const ROOT = import.meta.dirname;

const targets = [
  { name: "backend ", color: "\x1b[36m", cwd: path.join(ROOT, "backend"), port: 3000 },
  { name: "frontend", color: "\x1b[35m", cwd: path.join(ROOT, "frontend"), port: 8443 },
];

// Vite runs with strictPort, so a leftover dev server makes the whole thing die
// with a stack trace. Say what is actually holding the port instead.
const blocked = targets.flatMap(({ name, port }) => {
  try {
    const pids = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return pids ? [{ name: name.trim(), port, pids: pids.split("\n").join(" ") }] : [];
  } catch {
    return []; // lsof exits non-zero when nothing is listening
  }
});

if (blocked.length > 0) {
  for (const { name, port, pids } of blocked) {
    console.error(`✖ ${name} port ${port} is already in use by PID ${pids}`);
  }
  console.error(`\n  Stop them with:  kill ${blocked.map((b) => b.pids).join(" ")}\n`);
  process.exit(1);
}

const RESET = "\x1b[0m";
let shuttingDown = false;

const children = targets.map(({ name, color, cwd }) => {
  const child = spawn("pnpm", ["run", "dev"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  const prefix = (stream) => {
    let buffer = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        process.stdout.write(`${color}[${name}]${RESET} ${line}\n`);
      }
    });
  };

  prefix(child.stdout);
  prefix(child.stderr);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    process.stdout.write(
      `${color}[${name}]${RESET} exited (${signal ?? code}) — stopping the other process\n`,
    );
    shutdown(code ?? 1);
  });

  child.on("error", (error) => {
    process.stdout.write(`${color}[${name}]${RESET} failed to start: ${error.message}\n`);
    shutdown(1);
  });

  return child;
});

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 300);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0));
}
