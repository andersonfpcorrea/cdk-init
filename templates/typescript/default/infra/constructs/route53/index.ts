import type { EnvironmentName } from "@infra/config";
import { environmentConfig } from "@infra/config";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

interface Route53Props {
  envName: EnvironmentName;
  api: apigateway.RestApi;
}

export class Route53 extends Construct {
  constructor(scope: Construct, id: string, { api, envName }: Route53Props) {
    super(scope, id);

    const config = environmentConfig[envName]?.route53;
    if (
      !config?.domainName ||
      !config.hostedZoneId ||
      !config.recordName ||
      !config.zoneName
    ) {
      throw new Error("missing config values for Route53");
    }

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: config.hostedZoneId,
        zoneName: config.zoneName,
      },
    );
    let certificate: acm.ICertificate;
    if (config.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(
        this,
        "ImportedCertificate",
        config.certificateArn,
      );
    } else {
      certificate = new acm.Certificate(this, "ApiCertificate", {
        domainName: config.domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
    }

    const customDomain = new apigateway.DomainName(this, "ApiCustomDomain", {
      domainName: config.domainName,
      certificate,
      endpointType: apigateway.EndpointType.REGIONAL,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    // Add base path mapping to connect the custom domain to the API stage
    customDomain.addBasePathMapping(api, {
      basePath: api.deploymentStage.stageName,
    });

    // Create Route53 DNS record
    new route53.ARecord(this, "ApiDnsRecord", {
      zone: hostedZone,
      recordName: config.recordName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.ApiGatewayDomain(customDomain),
      ),
    });
  }
}
