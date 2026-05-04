import type { ZodTypeAny } from "zod";

export function validateSchema(schema: ZodTypeAny, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors.map((e) => e.message).join(", "),
    });
  }
  return result.data;
}
