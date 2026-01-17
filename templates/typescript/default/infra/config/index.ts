import type { Duration } from "aws-cdk-lib";
import type { Tracing } from "aws-cdk-lib/aws-lambda";
import type { LogGroupProps } from "aws-cdk-lib/aws-logs";

export type EnvironmentName = "Dev" | "PreProd" | "Prod";

export interface LambdaCommonConfig {
  logGroupProps: LogGroupProps;
  memorySize: number;
  timeout: Duration;
  tracing: Tracing;
  functionName?: string;
}

export interface EnvironmentConfig {
  awsEnvironment: { account: string; region: string; profile: string };
}

export const environmentConfig: Partial<
  Record<EnvironmentName, EnvironmentConfig>
> = {
  Dev: {
    awsEnvironment: {
      account: "{{AWS_DEV_ACCOUNT}}",
      region: "{{AWS_DEV_REGION}}",
      profile: "{{PROFILE}}",
    },
  },
};
