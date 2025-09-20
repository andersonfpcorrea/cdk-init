import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";

const cliPath = path.join(__dirname, "../.dist/index.js");
const tempDir = path.join(__dirname, "./temp");

describe("CLI E2E Test", { timeout: 30_000 }, () => {
  beforeAll(async () => {
    await fs.ensureDir(tempDir);
  });

  afterAll(() => {
    fs.removeSync(tempDir);
  });

  it("should create a new project", async () => {
    const projectName = "my-test-project";
    const projectPath = path.join(tempDir, projectName);

    const inputs = [
      { key: "Enter", value: projectName }, // serviceName
      { key: "Enter", value: "my-test-project-namespace" }, // projectNamespace
      { key: "Enter", value: "123456789012" }, // awsDevAccount
      { key: "Enter", value: "us-east-1" }, // awsDevRegion
      { key: "Enter", value: "default" }, // awsDevProfile
    ];

    const childProcess = execa("node", [cliPath, projectName], {
      cwd: tempDir,
    });

    for (const input of inputs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      childProcess.stdin.write(input.key === "Enter" ? "\n" : input.value);
    }

    const result = await childProcess;

    expect(result.exitCode).toBe(0);
    expect(fs.existsSync(projectPath)).toBe(true);

    // You can add more assertions here, e.g., check file contents
  });
});
