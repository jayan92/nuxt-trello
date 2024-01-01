// Importing the 'z' object from the 'zod' library for schema validation.
import { z } from "zod";

// Importing the 'SigninSchema' for reusing its structure in the extended schema.
import SigninSchema from "./Signin.schema";

// Defining a new schema by extending the 'SigninSchema'.
export default SigninSchema.extend({
  // Adding a 'name' field to the schema for user's name validation.
  name: z
    .string({
      // Error message if the 'name' field is required but not provided.
      required_error: "Please enter your name",

      // Error message if the 'name' field has an invalid type.
      invalid_type_error: "Please enter a valid name",
    })
    // Enforcing a minimum length of 3 characters for the 'name'.
    .min(3),

  // Adding a 'passwordConfirm' field to the schema by referencing the 'password' field
  // from the original 'SigninSchema'.
  passwordConfirm: SigninSchema.shape.password,
})
  // Refining the schema to ensure that the 'password' and 'passwordConfirm' fields match.
  .refine((data) => data.password === data.passwordConfirm, {
    // Error message displayed if the password confirmation fails.
    message: "Password do not match",

    // Specifying the path to the 'passwordConfirm' field for error targeting.
    path: ["passwordConfirm"],
  });
