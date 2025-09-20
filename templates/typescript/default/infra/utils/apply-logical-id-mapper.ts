import type { EnvironmentName } from "@infra/config";
import type { Stage } from "@infra/constructs/stage";
import { LogicalIdMapper } from "@matthewbonig/cdk-logical-id-mapper";
import { Aspects } from "aws-cdk-lib";

export function applyLogicalIdMapper(envName: EnvironmentName, stage: Stage) {
  if (needsLogicalIdMapping(envName)) {
    Aspects.of(stage).add(
      new LogicalIdMapper({
        map: getLogicalIdMappings(envName),
      }),
    );
  }
}

function needsLogicalIdMapping(envName: EnvironmentName) {
  const mappings = getLogicalIdMappings(envName);
  return Object.keys(mappings).length > 0;
}

/**
 * Logical ID mappings for preserving existing CloudFormation resources
 * during CDK refactoring. These mappings prevent resource recreation
 * when construct hierarchy changes.
 *
 * Format: { "NewLogicalId": "OldLogicalId" }
 */
function getLogicalIdMappings(envName: string) {
  const mappings = {
    // example:
    // dev: {
    //   devoldlogicalid: "devnewlogicalid",
    // },
  };
  return envName in mappings ? mappings[envName as keyof typeof mappings] : {};
}
