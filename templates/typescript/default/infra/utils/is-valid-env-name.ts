import type { EnvironmentName } from "@infra/config";

export function isValidEnvName(str: unknown): str is EnvironmentName {
  const envs = ["Dev", "PreProd", "Prod"] as const;
  return !!(
    typeof str === "string" &&
    str &&
    envs.includes(str as EnvironmentName)
  );
}
