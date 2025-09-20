import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface RestApiProps {
  envName: EnvironmentName;
}

export class RestApi extends Construct {
  public readonly api: apigateway.RestApi;
  envName: EnvironmentName;
  constructor(scope: Construct, id: string, props: RestApiProps) {
    super(scope, id);
    this.envName = props.envName;

    const config = environmentConfig[props.envName]?.apiGateway;
    if (
      !config?.corsOptionsMaxAge ||
      !config.description ||
      !config.stageName
    ) {
      throw new Error("missing config values for Api Gateway");
    }

    this.api = new apigateway.RestApi(this, "RestApi", {
      description: config.description,
      endpointConfiguration: { types: [apigateway.EndpointType.REGIONAL] },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["OPTIONS", "POST", "GET"],
        allowHeaders: ["*"],
        maxAge: config.corsOptionsMaxAge,
      },
      deployOptions: {
        stageName: config.stageName,
        description: config.description,
      },
    });
  }

  registerEndpoints(endpoints: ApiGatewayEndpoint[]) {
    endpoints.forEach((e) => e.registerEndpoint());
  }
}

export interface ApiGatewayEndpoint {
  registerEndpoint(): void;
}
