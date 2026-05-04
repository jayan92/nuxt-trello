import { validateSchema } from "~/utils/validate";
import SignupSchema from "~/schemas/Signup.schema";
import { User } from "~/server/models/User";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  validateSchema(SignupSchema, body);
  const user = await User.create(body);

  return { ...user.toObject(), password: undefined };
});
