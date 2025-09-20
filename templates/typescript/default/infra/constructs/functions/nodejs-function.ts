import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import type { EnvironmentName, LambdaCommonConfig } from "@infra/config";
import { COMMIT_HASH, ENV_NAME } from "@utils/constants";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction as CDKNodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface NodejsFunctionProps {
  envName: EnvironmentName;
  /**
   * All handlers are located at `@src/lambda`
   *
   * `handlerDirName` is the name of the directory where the handler.ts
   *  file is located.
   *
   *  @example  For the a lambda code that is in `@src/lambdas/get-har/handler.ts`,
   *  `handlerDirName` is `get-har`
   */
  handlerDirName: string;
  lambdaConfig: LambdaCommonConfig;
  environmentVariables?: Record<string, string>;
}

/**
 * Custom Nodejs Function construct
 *
 * It validates the handler directoty and sets the `ENV_NAME` environment variable
 *
 * The `NodejsFunction` id is passed down and used as `id` of the `CDKNodejsFunction` construct
 */
export class NodejsFunction extends Construct {
  public readonly lambda: CDKNodejsFunction;

  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id);
    const dirName = validateHandlerDir(props.handlerDirName);
    this.lambda = new CDKNodejsFunction(this, `NodejsFunction-${id}`, {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, `../../../src/lambdas/${dirName}/handler.ts`),
      handler: "handler",
      ...props.lambdaConfig,
      environment: {
        [ENV_NAME]: props.envName,
        // commit-has is used in aws powertools logger
        [COMMIT_HASH]: execSync("git rev-parse HEAD").toString().trim(),
        ...props.environmentVariables,
      },
      bundling: {
        externalModules: [],
        tsconfig: path.join(__dirname, "../../../tsconfig.json"),
        minify: true,
        target: "es2020",
      },
    });
  }
}

function validateHandlerDir(dirName: string) {
  const lambdaPath = path.join(__dirname, "../../../src/lambdas");
  try {
    if (!existsSync(lambdaPath)) {
      throw new Error(`Lambda directory not found at: ${lambdaPath}`);
    }
    const entries = readdirSync(lambdaPath, { withFileTypes: true });
    const validDirs = entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => {
        const handlerPath = path.join(lambdaPath, entry.name, "handler.ts");
        return existsSync(handlerPath);
      })
      .map((entry) => entry.name);
    if (!validDirs.includes(dirName)) {
      throw new Error(
        `Invalid handler directory: '${dirName}'.\n` +
          `Valid directories are: ${validDirs.length > 0 ? validDirs.join(", ") : "(none found)"}`,
      );
    }
    return dirName;
  } catch (error) {
    console.error(error);
    throw new Error("[NodejsFunction]: Error validating handler directory");
  }
}
