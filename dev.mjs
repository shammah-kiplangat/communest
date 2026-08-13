#!/usr/bin/env node
/**
 * Runs the backend (:3000) and frontend (:8443) together with prefixed output.
 * Ctrl+C stops both; if either exits, the other is torn down too.
 *
 * Cross-platform: on Windows `pnpm` is a .cmd shim that needs a shell to
 * resolve, child processes must be killed as a tree via taskkill, and lsof
 * does not exist — so the port probe is done with a plain socket bind.
 */
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";

const ROOT = import.meta.dirname;
const isWindows = process.platform === "win32";
const RESET = "\x1b[0m";

const targets = [
  { name: "backend ", color: "\x1b[36m", cwd: path.join(ROOT, "backend"), port: 3000 },
  { name: "frontend", color: "\x1b[35m", cwd: path.join(ROOT, "frontend"), port: 8443 },
];

/** Bind-test rather than shelling out, so this works on every platform. */
function portInUse(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", (error) => resolve(error.code === "EADDRINUSE"));
    probe.once("listening", () => probe.close(() => resolve(false)));
    probe.listen(port, "0.0.0.0");
  });
}

/** Best effort — used only to make the error message actionable. */
function pidsOnPort(port) {
  try {
    if (isWindows) {
      const out = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split("\n")) {
        if (/LISTENING/i.test(line) && new RegExp(`[:.]${port}\\s`).test(line)) {
          pids.add(line.trim().split(/\s+/).pop());
        }
      }
      return [...pids];
    }
    return execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Vite runs with strictPort, so a leftover dev server makes the whole thing die
// with a stack trace. Say what is actually holding the port instead.
const blocked = [];
for (const { name, port } of targets) {
  if (await portInUse(port)) blocked.push({ name: name.trim(), port, pids: pidsOnPort(port) });
}

if (blocked.length > 0) {
  for (const { name, port, pids } of blocked) {
    const who = pids.length > 0 ? ` by PID ${pids.join(", ")}` : "";
    console.error(`✖ ${name} port ${port} is already in use${who}`);
  }
  const allPids = blocked.flatMap((b) => b.pids);
  if (allPids.length > 0) {
    console.error(
      isWindows
        ? `\n  Stop them with:  ${allPids.map((p) => `taskkill /PID ${p} /T /F`).join("  &  ")}\n`
        : `\n  Stop them with:  kill ${allPids.join(" ")}\n`,
    );
  }
  process.exit(1);
}

let shuttingDown = false;

const children = targets.map(({ name, color, cwd }) => {
  const child = spawn("pnpm", ["run", "dev"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    // Windows needs a shell to resolve the pnpm.cmd shim; on POSIX we skip it
    // so signals reach the real process rather than an intermediate shell.
    shell: isWindows,
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
    child.failedToStart = true;
    process.stdout.write(`${color}[${name}]${RESET} failed to start: ${error.message}\n`);
    if (error.code === "ENOENT") {
      process.stdout.write(
        `${color}[${name}]${RESET} is pnpm installed and on PATH? Try: npm install -g pnpm\n`,
      );
    }
    shutdown(1);
  });

  return child;
});

function killChild(child) {
  // A child that never spawned has no pid, and killing it throws EINVAL.
  if (child.failedToStart || !child.pid || child.exitCode !== null || child.signalCode) return;
  try {
    if (isWindows) {
      // child.kill() would only stop the cmd shim and orphan vite/tsx,
      // leaving the ports held.
      execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  } catch {
    // already gone
  }
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) killChild(child);
  setTimeout(() => process.exit(code), 300);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0));
}
