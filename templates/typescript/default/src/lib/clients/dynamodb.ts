import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import { tracer } from "@src/lib/powertools";
import { ENV_NAME } from "@utils/constants";

const dynamodb = DynamoDBDocument.from(
  new DynamoDB({
    region:
      environmentConfig[process.env?.[ENV_NAME] as EnvironmentName]
        ?.awsEnvironment.region,
  }),
);

tracer.captureAWSv3Client(dynamodb);

export { dynamodb };
