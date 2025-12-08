import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function addAdminUser(email: string, name: string, password: string) {
  const { auth } = await import("../lib/admin-auth.js");
  const result = await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
    },
  });

  console.log(result.user);
}

const email = process.argv[2];
const name = process.argv[3];
const password = process.argv[4];

addAdminUser(email, name, password)
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
