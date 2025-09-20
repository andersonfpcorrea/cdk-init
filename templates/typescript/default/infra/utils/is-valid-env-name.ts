import type { EnvironmentName } from "@infra/config";

export function isValidEnvName(str: unknown): str is EnvironmentName {
  const envs: EnvironmentName[] = ["dev", "dev", "prod"];
  return !!(
    typeof str === "string" &&
    str &&
    envs.includes(str as EnvironmentName)
  );
}
