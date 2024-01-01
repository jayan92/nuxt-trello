import { z } from "zod";

// Define a validation schema using z.object
export default z.object({
  // Define validation rules for the 'email' field
  email: z
    .string({
      // Custom error message for invalid type (not a string)
      invalid_type_error: "Please enter a valid email address",
      // Custom error message for a missing (required) email
      required_error: "Please enter your email address",
    })
    // Use the z.email method to ensure it's a valid email format
    .email(),

  // Define validation rules for the 'password' field
  password: z.string().min(8), // Ensure the password is at least 8 characters long
});
