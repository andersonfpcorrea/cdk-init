import type { EnvironmentName } from "@infra/config";
import { RestApi } from "@infra/constructs/api-gateway";
import { Route53 } from "@infra/constructs/route53";
import { Waf } from "@infra/constructs/waf";
import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

import { CustomersEndpoint } from "../endpoints/customers-endpoint";

interface StackProps extends cdk.StackProps {
  envName: EnvironmentName;
}

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const gateway = new RestApi(this, "Api", {
      envName: props.envName,
    });

    gateway.registerEndpoints([
      new CustomersEndpoint(this, "CustomersEndpoint", {
        api: gateway.api,
        apiKeyRequired: true,
        envName: props.envName,
        resourceName: "customers",
      }),
    ]);

    new Route53(this, "Route53", {
      api: gateway.api,
      envName: props.envName,
    });

    new Waf(this, "Waf", { api: gateway.api, envName: props.envName });
  }
}
