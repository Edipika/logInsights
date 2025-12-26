import { RequestHandler } from "express";
import { ZodError, ZodType } from "zod";

export const validateLog = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const field = issue.path.join(".");
          // show only first error per field
          if (!formattedErrors[field]) {
            formattedErrors[field] = issue.message;
          }
        });

        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
          rawErrors: error.issues,

        });
      }

      next(error);
    }
  };
};


/**zod patterns
 * Required = string()
 * Required + non-empty=z.string().min(1, "service is required")
 * Optional but if present must be non-empty=service: z.string().min(1).optional()
 * Nullable message =string().min(1).nullable()
*/