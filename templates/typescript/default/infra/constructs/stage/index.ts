import type { EnvironmentName } from "@infra/config";
import { Stack } from "@infra/constructs/stack";
import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface StageProps extends cdk.StageProps {
  envName: EnvironmentName;
}

export class Stage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    const stack = new Stack(this, "Stack", {
      ...props,
      envName: props.envName,
    });
    cdk.Tags.of(stack).add("env", id);
    cdk.Tags.of(stack).add("application", "DefaultApp");
  }
}
