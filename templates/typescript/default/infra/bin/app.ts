#!/usr/bin/env node
import { environmentConfig } from "@infra/config";
import { Stage } from "@infra/constructs/stage";
import { isValidEnvName } from "@infra/utils/is-valid-env-name";
import { STAGE_NAME } from "@utils/constants";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks, ServerlessChecks } from "cdk-nag";

const app = new cdk.App();

cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
cdk.Aspects.of(app).add(new ServerlessChecks({ verbose: true }));

const envName = app.node.tryGetContext(STAGE_NAME);
if (!isValidEnvName(envName)) throw new Error("invalid stage name");
if (!environmentConfig[envName]?.awsEnvironment)
  throw new Error("missing aws environment data");

new Stage(app, "Stage", {
  env: environmentConfig[envName].awsEnvironment,
  envName,
});
