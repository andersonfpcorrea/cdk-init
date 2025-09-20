import type { EnvironmentName } from "@infra/config";
import { Stack } from "@infra/constructs/stack";
import { SERVICE_NAME } from "@utils/constants";
import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface StageProps extends cdk.StageProps {
  envName: EnvironmentName;
}

export class Stage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const stack = new Stack(this, `${props.envName}-${SERVICE_NAME}-Stack`, {
      ...props,
      envName: props.envName,
    });
    cdk.Tags.of(stack).add("env", props.envName);
    cdk.Tags.of(stack).add("application", SERVICE_NAME);
  }
}
