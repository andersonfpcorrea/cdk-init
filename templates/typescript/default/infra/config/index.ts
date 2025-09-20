import * as cdk from "aws-cdk-lib";

export type EnvironmentName = "dev" | "preprod" | "prod";

export interface LambdaCommonConfig {
  logGroupProps: cdk.aws_logs.LogGroupProps;
  memorySize: number;
  timeout: cdk.Duration;
  tracing: cdk.aws_lambda.Tracing;
  functionName?: string;
}

export interface EnvironmentConfig {
  awsEnvironment: { account: string; region: string; profile: string };
  waf: {
    rateLimit: number;
    evaluationWindowSec: 60 | 120 | 300 | 600;
    scope: "CLOUDFRONT" | "REGIONAL";
  };
  apiGateway: {
    corsOptionsMaxAge: cdk.Duration;
    stageName: string;
    description: string;
  };
  route53: {
    domainName: string;
    hostedZoneId: string;
    zoneName: string;
    recordName: string;
    certificateArn?: string;
  };
  customersEndpoint: {
    postCustomerLambda: LambdaCommonConfig;
  };
}

export const environmentConfig: Partial<
  Record<EnvironmentName, EnvironmentConfig>
> = {
  dev: {
    awsEnvironment: { account: "", region: "", profile: "" },
    waf: { rateLimit: 60, evaluationWindowSec: 60, scope: "REGIONAL" },
    apiGateway: {
      corsOptionsMaxAge: cdk.Duration.days(1),
      stageName: "v1",
      description: "API gateway for my app (dev)",
    },
    route53: {
      domainName: "",
      hostedZoneId: "", // "ASHDH234...",
      zoneName: "", // "domain.com"
      recordName: "", // "subdomain.dev"
    },
    customersEndpoint: {
      postCustomerLambda: {
        logGroupProps: { retention: cdk.aws_logs.RetentionDays.ONE_WEEK },
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        tracing: cdk.aws_lambda.Tracing.ACTIVE,
        functionName: "PostCustomersLambda",
      },
    },
  },
};
