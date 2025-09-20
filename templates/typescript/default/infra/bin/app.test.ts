import { environmentConfig } from "@infra/config";
import { Stage } from "@infra/constructs/stage";
import { App, type Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";

describe("Stack snapshot test", { timeout: 60_000 }, () => {
  it("should create dev stage with correct environment config and match the previous snapshot", () => {
    if (!environmentConfig.dev?.awsEnvironment) {
      throw new Error("missing aws env config");
    }

    const app = new App();
    const stage = new Stage(app, "dev", {
      envName: "dev",
      env: environmentConfig.dev.awsEnvironment,
    });
    expect(stage).toBeDefined();
    expect(stage.account).toBe("your-acount");
    expect(stage.region).toBe("your-region");
    const stack = stage.node.findChild("Stack");
    const template = Template.fromStack(stack as Stack);
    expect(template.toJSON()).toMatchSnapshot("dev");
  });
});
