import { tracer } from ".";

/**
 * Decorator to wrap async methods with AWS X-Ray tracing
 * @param segmentName - Optional custom segment name. If not provided, uses method name
 */
export function trace(segmentName?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const subsegmentName = `### ${segmentName || propertyKey}`;
      const subsegment = tracer.getSegment()?.addNewSubsegment(subsegmentName);
      if (subsegment) tracer.setSegment(subsegment);
      let result;
      let error;
      try {
        result = await originalMethod.apply(this, args);
      } catch (e) {
        if (e instanceof Error) error = e;
      }
      subsegment?.close();
      if (subsegment) tracer.setSegment(subsegment.parent);
      if (result) return result;
      throw error;
    };
  };
}
