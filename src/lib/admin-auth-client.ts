import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/admin/api/auth",
});

export const { signIn, signOut, useSession } = authClient;
