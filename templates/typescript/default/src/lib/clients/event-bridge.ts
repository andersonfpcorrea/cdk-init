import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import { tracer } from "@src/lib/powertools";
import { ENV_NAME } from "@utils/constants";

const eventBridge = new EventBridgeClient({
  region:
    environmentConfig[process.env?.[ENV_NAME] as EnvironmentName]
      ?.awsEnvironment.region,
});

tracer.captureAWSv3Client(eventBridge);

export { eventBridge, PutEventsCommand };
