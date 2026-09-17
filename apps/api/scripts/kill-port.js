import { execSync } from "child_process";

const port = Number(process.env.PORT ?? 5001);

try {
  const output = execSync(`netstat -ano | findstr :${port}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const pids = new Set();

  for (const line of lines) {
    const parts = line.split(/\s+/);
    const pid = Number(parts.at(-1));
    if (Number.isFinite(pid)) {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Stopped process on port ${port}: PID ${pid}`);
    } catch {
      console.warn(`Could not stop PID ${pid} on port ${port}`);
    }
  }
} catch {
  console.log(`No existing process found on port ${port}`);
}
