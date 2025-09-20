import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import { NodejsFunction } from "@infra/constructs/functions/nodejs-function";
import { ENV_NAME_USED_IN_POST_CUSTOMERS } from "@src/lambdas/post-customer/utils";
import { Construct } from "constructs";

interface PostCustomerLambdaProps {
  envName: EnvironmentName;
}

export class PostCustomerLambda extends Construct {
  public readonly lambda: NodejsFunction["lambda"];

  constructor(scope: Construct, id: string, props: PostCustomerLambdaProps) {
    super(scope, id);

    const config =
      environmentConfig[props.envName]?.customersEndpoint.postCustomerLambda;
    if (!config?.logRetention || !config.memorySize || !config.timeout)
      throw new Error("missing config values for PostCustomerLambda");

    this.lambda = new NodejsFunction(this, "PostCustomersLambda", {
      envName: props.envName,
      handlerDirName: "post-customer",
      lambdaConfig: config,
      environmentVariables: {
        [ENV_NAME_USED_IN_POST_CUSTOMERS]: "some value",
      },
    }).lambda;
  }
}
