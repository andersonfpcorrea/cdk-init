export const HttpStatus = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  RequestTimeout: 408,
  PayloadTooLarge: 413,
  UnsupportedMediaType: 415,
  TooManyRequests: 429,
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const;

export const Methods = {
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

export type HttpMethods = keyof typeof Methods;

export const retryableStatusCodes = [
  HttpStatus.InternalServerError,
  HttpStatus.BadGateway,
  HttpStatus.ServiceUnavailable,
  HttpStatus.GatewayTimeout,
  HttpStatus.RequestTimeout,
  HttpStatus.TooManyRequests,
];
