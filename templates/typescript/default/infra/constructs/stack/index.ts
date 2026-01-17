import type { EnvironmentName } from "@infra/config";
import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface StackProps extends cdk.StackProps {
  envName: EnvironmentName;
}

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
