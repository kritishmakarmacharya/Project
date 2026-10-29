import { type Request, type Response, type NextFunction } from "express";

export default function errorHandlingMiddleware(
  error: any,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  console.log(error);
  let rawCode = error?.code || 500;
  let code = 500;

  if (typeof rawCode === "string") {
    if (rawCode === "MISSING_FIELD_NAME" || rawCode.startsWith("LIMIT_")) {
      code = 400;
    } else {
      code = 500;
    }
  } else if (typeof rawCode === "number") {
    code = rawCode;
  }

  let detail = error?.detail || error?.details || null;
  let message = error?.message || "Internal Server Error...";

  if (error.code === 11000) {
    code = 409;
    const field = Object.keys(error.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exist`;
  } else if (error.code && error.code >= 100 && error.code < 1000) {
    code = error.code;
  } else if (error.status && error.status >= 100 && error.status < 1000) {
    code = error.status;
  }

  res.status(code).json({
    data: detail,
    message: message,
    meta: null,
  });
}
