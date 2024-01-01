// Importing the NuxtAuthHandler for handling authentication in Nuxt.
import { NuxtAuthHandler } from "#auth";

// Importing the CredentialsProvider from next-auth to handle credentials-based authentication.
import CredentialsProvider from "next-auth/providers/credentials";

// Importing the User model for user-related operations.
import { User } from "~/server/models/User";

// Function to retrieve a user based on the provided ID.
async function getUser(id: string) {
  // Finding a user by ID in the User model.
  const user = await User.findById(id);

  // Returning the user's data in JSON format if found.
  return user?.toJSON();
}

// Exporting the NuxtAuthHandler configuration for authentication.
export default NuxtAuthHandler({
  // Retrieving the authentication secret from runtime configuration.
  secret: useRuntimeConfig().auth.secret,

  // Configuring authentication pages, specifying the sign-in page.
  pages: {
    signIn: "/auth/signin",
  },

  // Configuring authentication providers, in this case, using credentials.
  providers: [
    //@ts-expect-error (Ignoring TypeScript error due to lack of type definitions)
    CredentialsProvider.default({
      name: "credentials",
      // Retrieving the authentication origin from runtime configuration.
      origin: useRuntimeConfig().auth.origin,

      // Authorizing the user based on the provided credentials.
      async authorize(credential: { email: string; password: string }) {
        // Finding a user with the provided email in the User model.
        const user = await User.findOne({ email: credential.email }).select("+password");

        // If no user is found, return null (indicating unauthorized access).
        if (!user) {
          return null;
        }

        // Checking if the provided password is valid for the user.
        const isValid = await user.comparePassword(credential.password);

        // If the password is not valid, return null (indicating unauthorized access).
        if (!isValid) {
          return null;
        }

        // Returning the user's data in JSON format if authorized.
        return user.toJSON();
      },
    }),
  ],

  // Configuring the session strategy to use JWT (JSON Web Token).
  session: {
    strategy: "jwt",
  },

  // Configuring callback functions for JWT and session handling.
  callbacks: {
    // Callback for updating the JWT token with user information.
    async jwt({ token, user }) {
      // If user information is available, update the token with the user's data.
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }
      // Returning the updated token.
      return token;
    },

    // Callback for updating the user session with refreshed user information.
    async session({ session, token }) {
      // @ts-expect-error (Ignoring TypeScript error due to lack of type definitions)
      const refreshedUser = await getUser(token._id);

      // @ts-ignore (Ignoring TypeScript error due to lack of type definitions)
      session.user = {
        ...token,
        ...session.user,
        ...refreshedUser,
      };

      // Returning the updated session.
      return session;
    },
  },
});
