import { AppError } from "../utils/AppError.js";

export function validate(schema, property = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues[0]?.message ?? "Validation failed",
          400,
        ),
      );
    }

    req[property] = result.data;
    return next();
  };
}
