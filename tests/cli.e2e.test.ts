import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";

const cliPath = path.join(__dirname, "../.dist/index.js");
const tempDir = path.join(__dirname, "./temp");

describe("CLI E2E Test", { timeout: 40_000 }, () => {
  beforeAll(async () => {
    await fs.ensureDir(tempDir);
  });

  afterAll(() => {
    fs.removeSync(tempDir);
  });

  it("should create a new project", async () => {
    const serviceName = `my-test-project-${Date.now()}`;
    const projectPath = path.join(tempDir, serviceName);

    const inputs = [
      serviceName, // serviceName
      `${serviceName}-organization`, // projectNamespace
      "123456789012", // awsDevAccount
      "us-east-1", // awsDevRegion
      "default", // awsDevProfile
    ];

    const childProcess = execa("node", [cliPath], {
      cwd: tempDir,
      stdio: ["pipe", "inherit", "inherit"],
    });

    for (const input of inputs) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      childProcess.stdin.write(input + "\n");
    }

    const result = await childProcess;

    expect(result.exitCode).toBe(0);
    expect(fs.existsSync(projectPath)).toBe(true);

    // Check if Git was initialized
    expect(fs.existsSync(path.join(projectPath, ".git"))).toBe(true);

    // Check if template placeholders were updated correctly
    const pkgJson = await fs.readJson(path.join(projectPath, "package.json"));
    expect(pkgJson.name).toBe(serviceName);
    expect(pkgJson.scripts["deploy:dev"]).toContain(serviceName);

    const constantsContent = await fs.readFile(
      path.join(projectPath, "utils/constants.ts"),
      "utf8"
    );
    expect(constantsContent).toContain(
      `export const SERVICE_NAME = "${serviceName}";`
    );
    expect(constantsContent).toContain(
      `export const PROJECT_NAMESPACE = "${serviceName}-organization";`
    );

    const configContent = await fs.readFile(
      path.join(projectPath, "infra/config/index.ts"),
      "utf8"
    );
    expect(configContent).toContain(`account: "123456789012",`);
    expect(configContent).toContain(`region: "us-east-1",`);
    expect(configContent).toContain(`profile: "default",`);

    // Check if dependencies were installed
    expect(fs.existsSync(path.join(projectPath, "node_modules"))).toBe(true);
  });
});
