import type { EnvironmentName } from "@infra/config";
import type { ApiGatewayEndpoint } from "@infra/constructs/api-gateway";
import type { HttpMethods } from "@src/lib/http/constants";
import type { RestApi } from "aws-cdk-lib/aws-apigateway";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import type { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

import { PostCustomerLambda } from "../lambdas/post-customer";

interface CustomersEndpointProps {
  api: RestApi;
  envName: EnvironmentName;
  resourceName: string;
  apiKeyRequired: boolean;
}

export class CustomersEndpoint extends Construct implements ApiGatewayEndpoint {
  handlers: Record<Extract<HttpMethods, "POST">, Function>;
  constructor(
    scope: Construct,
    id: string,
    private readonly props: CustomersEndpointProps,
  ) {
    super(scope, id);
    this.handlers = {
      POST: new PostCustomerLambda(this, "PostCustomerLambda", {
        envName: this.props.envName,
      }).lambda,
    };
  }

  registerEndpoint() {
    this.props.api.root
      .addResource(this.props.resourceName)
      .addMethod("POST", new LambdaIntegration(this.handlers.POST), {
        operationName: "PostCustomer",
        apiKeyRequired: this.props.apiKeyRequired,
      });
  }
}
