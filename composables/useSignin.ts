// Importing necessary types for form handling and validation from Nuxt UI and Zod.
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "zod";

// Importing the SigninSchema for form validation.
import SigninSchema from "~/schemas/Signin.schema";

// Creating a composable function for handling the sign-in form.
export const useSignin = () => {
  // Creating a reactive object to hold the form state (email and password).
  const formState = reactive({
    email: undefined,
    password: undefined,
  });

  // Assigning the SigninSchema for validation to the 'validationSchema' variable.
  const validationSchema = SigninSchema;

  // Creating a ref to track the loading state of the form.
  const isLoading = ref(false);

  // Accessing the router and authentication functions from Nuxt's useAuth and useRouter.
  const router = useRouter();
  const { signIn } = useAuth();

  // Handling the form submission when the user tries to sign in.
  async function handleSubmit(event: FormSubmitEvent<z.output<typeof validationSchema>>) {
    try {
      // Setting the loading state to true to indicate the form is being processed.
      isLoading.value = true;

      // Attempting to sign in with the provided credentials.
      // @ts-expect-error (Ignoring TypeScript error for now due to lack of type definitions)
      const { error } = await signIn("credentials", {
        redirect: false,
        email: event.data.email,
        password: event.data.password,
      });

      // If there is an error during the sign-in process, throw an error.
      if (error) {
        throw new Error(error);
      }

      // If sign-in is successful, redirect the user to the home page.
      router.push("/");
    } catch (e) {
      // If an error occurs during the sign-in process, display an error toast.
      useToast().add({
        id: "error",
        title: "Invalid credentials",
        color: "red",
        icon: "i-heroicons-information-circle",
        timeout: 3000,
      });
    } finally {
      // Resetting the loading state regardless of the outcome (success or error).
      isLoading.value = false;
    }
  }

  // Returning the relevant values and functions for the sign-in form.
  return {
    formState,
    isLoading,
    validationSchema,
    handleSubmit,
  };
};
