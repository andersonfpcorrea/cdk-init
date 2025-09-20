import type {
  EnvironmentConfig,
  EnvironmentName} from "@infra/config";
import {
  environmentConfig
} from "@infra/config";
import { aws_wafv2 as waf } from "aws-cdk-lib";
import type { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface WafProps {
  api: RestApi;
  envName: EnvironmentName;
}

export class Waf extends Construct {
  config: EnvironmentConfig["waf"];
  constructor(scope: Construct, id: string, props: WafProps) {
    super(scope, id);

    const c = environmentConfig[props.envName]?.waf;
    if (!c?.evaluationWindowSec || !c?.rateLimit || !c?.scope) {
      throw new Error("missing config values for Waf");
    }
    this.config = c;

    const webAcl = new waf.CfnWebACL(this, "WafAcl", {
      defaultAction: { allow: {} },
      scope: this.config.scope,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "WafMetrics",
        sampledRequestsEnabled: true,
      },
      rules: [
        this.awsCoreRuleSet(),
        this.knownBadPatterns(),
        this.anonymousIpList(),
        this.rateLimiting(),
      ],
    });

    new waf.CfnWebACLAssociation(this, "WafApiAssociation", {
      resourceArn: props.api.deploymentStage.stageArn,
      webAclArn: webAcl.attrArn,
    });
  }

  awsCoreRuleSet() {
    return {
      name: "AWSManagedRulesCommonRuleSet",
      priority: 1,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesCommonRuleSet",
          ruleActionOverrides: [
            {
              actionToUse: { count: {} },
              name: "SizeRestrictions_BODY",
            },
            {
              actionToUse: { count: {} },
              name: "EC2MetaDataSSRF_BODY",
            },
          ],
        },
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "AWSCommonRules",
      },
    };
  }

  knownBadPatterns() {
    return {
      name: "AWSManagedRulesKnownBadInputsRuleSet",
      priority: 2,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesKnownBadInputsRuleSet",
        },
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "AWSKnownBadInputsRules",
      },
    };
  }

  anonymousIpList() {
    return {
      name: "AWSManagedRulesAnonymousIpList",
      priority: 3,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: "AWS",
          name: "AWSManagedRulesAnonymousIpList",
        },
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "AWSAnonymousIpList",
      },
    };
  }

  rateLimiting() {
    return {
      name: "RateLimit",
      priority: 4,
      action: { block: {} },
      statement: {
        rateBasedStatement: {
          limit: this.config.rateLimit,
          evaluationWindowSec: this.config.evaluationWindowSec,
          aggregateKeyType: "IP",
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "RateLimitMetric",
        sampledRequestsEnabled: true,
      },
    };
  }
}
