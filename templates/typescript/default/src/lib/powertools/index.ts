import { PT_VERSION as version } from "@aws-lambda-powertools/commons";
import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { environmentConfig } from "@infra/config";
import {
  COMMIT_HASH,
  ENV_NAME,
  PROJECT_NAMESPACE,
  SERVICE_NAME,
} from "@utils/constants";

const defaultValues = {
  awsAccount: environmentConfig.dev?.awsEnvironment.account ?? "",
  awsRegion: environmentConfig.dev?.awsEnvironment.region ?? "",
  environment: process.env?.[ENV_NAME] ?? "",
};

const logger = new Logger({
  sampleRateValue: 0,
  serviceName: SERVICE_NAME,
  environment: process.env?.[ENV_NAME],
  persistentKeys: {
    ...defaultValues,
    logger: {
      name: "@aws-lambda-powertools/logger",
      version,
    },
  },
});

const metrics = new Metrics({
  defaultDimensions: {
    ...defaultValues,
    commitHash: process.env?.[COMMIT_HASH] ?? "",
    appName: SERVICE_NAME,
    appVersion: "v1.0.0",
    runtime: process.env.AWS_EXECUTION_ENV ?? "",
  },
  namespace: PROJECT_NAMESPACE,
  serviceName: SERVICE_NAME,
  functionName: process.env?.AWS_LAMBDA_FUNCTION_NAME,
});

const tracer = new Tracer({ serviceName: SERVICE_NAME });

export { logger, metrics, tracer };
