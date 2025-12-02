import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function addAdminUser() {
  const { auth } = await import("../lib/admin-auth.js");
  const result = await auth.api.signUpEmail({
    body: {
      email: "prasko@blastctrl.com",
      name: "demo-admin",
      password: "demo-admin",
    },
  });

  console.log(result.user);
}

addAdminUser()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
