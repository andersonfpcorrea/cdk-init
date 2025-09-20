import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import { tracer } from "@src/lib/powertools";
import { ENV_NAME } from "@utils/constants";

const s3 = new S3Client({
  region:
    environmentConfig[process.env?.[ENV_NAME] as EnvironmentName]
      ?.awsEnvironment.region,
});

tracer.captureAWSv3Client(s3);

export { GetObjectCommand, PutObjectCommand, s3 };
