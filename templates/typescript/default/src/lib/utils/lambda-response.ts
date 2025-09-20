import { HttpStatus } from "@src/lib/http/constants";
import type { APIGatewayProxyResult } from "aws-lambda";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const lambdaCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

interface LambdaResponseArgs {
  body:
    | Record<string | number | symbol, unknown>
    | Record<string, unknown>[]
    | string;
  statusCode: APIGatewayProxyResult["statusCode"];
  headers?: APIGatewayProxyResult["headers"];
  isBase64Encoded?: APIGatewayProxyResult["isBase64Encoded"];
  multiValueHeaders?: APIGatewayProxyResult["multiValueHeaders"];
}

interface ErrorResponse {
  detail: string;
  instance?: string;
  extensionMembers?: Record<
    string,
    string | string[] | number | boolean | undefined
  >;
}

function genHandlerResponse({
  body,
  statusCode,
  headers = defaultHeaders,
  isBase64Encoded,
  multiValueHeaders,
}: LambdaResponseArgs): APIGatewayProxyResult {
  try {
    const respBody = typeof body === "string" ? body : JSON.stringify(body);
    return {
      body: respBody,
      statusCode,
      headers,
      isBase64Encoded,
      multiValueHeaders,
    };
  } catch (e) {
    console.log(e);
    return {
      body: JSON.stringify(
        genProblemDetailsJsonResponse({
          typeCode: HttpStatus.INTERNAL_SERVER_ERROR,
          title: "Internal server error",
        }),
      ),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

/**
 * Ref: [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
 */
function genProblemDetailsJsonResponse({
  typeCode,
  title,
  detail,
  instance,
  extensionMembers = {},
}: {
  typeCode: number;
  title?: string;
  detail?: string;
  instance?: string;
  extensionMembers?: Record<
    string,
    | string
    | boolean
    | number
    | string[]
    | number[]
    | undefined
    | Record<string, number | boolean | string>
  >;
}) {
  return {
    type: statusCodeDetails[typeCode].type,
    title: title ?? statusCodeDetails[typeCode].title,
    detail,
    instance,
    ...extensionMembers,
  };
}

const statusCodeDetails: Record<number, { type: string; title: string }> = {
  500: {
    type: "https://datatracker.ietf.org/doc/html/rfc9110#name-500-internal-server-error",
    title: "Internal server error",
  },
  400: {
    type: "https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.1",
    title: "Bad request",
  },
  404: {
    type: "https://datatracker.ietf.org/doc/html/rfc9110#name-404-not-found",
    title: "Not found",
  },
};

export class LambdaResponse {
  static ok(
    data: LambdaResponseArgs["body"],
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      body: data,
      statusCode: HttpStatus.OK,
      headers: {
        "Content-Type": "application/json",
        ...lambdaCorsHeaders,
        ...headers,
      },
    });
  }

  static created(
    data: LambdaResponseArgs["body"],
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      body: data,
      statusCode: HttpStatus.CREATED,
      headers: {
        "Content-Type": "application/json",
        ...lambdaCorsHeaders,
        ...headers,
      },
    });
  }

  static internalServerError(
    props: ErrorResponse,
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      headers: {
        "Content-Type": "application/problem+json",
        ...lambdaCorsHeaders,
        ...headers,
      },
      body: genProblemDetailsJsonResponse({
        typeCode: HttpStatus.INTERNAL_SERVER_ERROR,
        ...props,
      }),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  static badRequest(
    props: ErrorResponse,
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      headers: {
        "Content-Type": "application/problem+json",
        ...lambdaCorsHeaders,
        ...headers,
      },
      body: genProblemDetailsJsonResponse({
        typeCode: HttpStatus.BAD_REQUEST,
        ...props,
      }),
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }

  static notFound(
    props: ErrorResponse,
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      headers: {
        "Content-Type": "application/problem+json",
        ...lambdaCorsHeaders,
        ...headers,
      },
      body: genProblemDetailsJsonResponse({
        typeCode: HttpStatus.NOT_FOUND,
        ...props,
      }),
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  static forbidden(
    props: ErrorResponse,
    headers?: LambdaResponseArgs["headers"],
  ) {
    return genHandlerResponse({
      headers: {
        "Content-Type": "application/problem+json",
        ...lambdaCorsHeaders,
        ...headers,
      },
      body: genProblemDetailsJsonResponse({
        typeCode: HttpStatus.FORBIDDEN,
        ...props,
      }),
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
