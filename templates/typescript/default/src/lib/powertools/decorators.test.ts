import { describe, expect, it, vi } from "vitest";

import { trace } from "./decorators";

const close = vi.hoisted(() => vi.fn());
const addNewSubsegment = vi.hoisted(() => vi.fn().mockReturnValue({ close }));
const setSegment = vi.hoisted(() => vi.fn());
const getSegment = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    addNewSubsegment,
  }),
);
vi.mock("./index", async () => {
  return {
    tracer: {
      getSegment,
      setSegment,
    },
  };
});

describe("powertools/decorators tests", () => {
  it("trace decorator should not interfer with the wrapped function and assume the trace name from the method name", async () => {
    const returnStr = "testMethod";
    class Test {
      @trace()
      async testMethod() {
        return returnStr;
      }
    }
    const res = await new Test().testMethod();
    expect(res).toBe(returnStr);
    expect(getSegment).toHaveBeenCalledOnce();
    expect(addNewSubsegment).toHaveBeenCalledWith(`### ${returnStr}`);
    expect(setSegment).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledOnce();
  });
  it("trace decorator should not interfer with the wrapped function and accept the trace name as param", async () => {
    const traceName = "traceName";
    const returnStr = "some return value";
    class Test {
      @trace(traceName)
      async testMethod() {
        return returnStr;
      }
    }
    const res = await new Test().testMethod();
    expect(res).toBe(returnStr);
    expect(getSegment).toHaveBeenCalledOnce();
    expect(addNewSubsegment).toHaveBeenCalledWith(`### ${traceName}`);
    expect(setSegment).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledOnce();
  });
});
