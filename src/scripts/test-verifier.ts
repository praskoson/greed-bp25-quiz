import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function testVerifier(
  txId: string,
  publicKey: string,
  solAmount: number,
  daysAmount: number,
) {
  const { validateStakeTransaction } = await import(
    "../app/api/stake/verify-job/verifer.js"
  );

  const result = await validateStakeTransaction(txId, {
    expectedLamportsAmount: BigInt(solAmount * 1e9),
    expectedDurationSeconds: daysAmount * 24 * 60 * 60,
    expectedOwner: publicKey,
  });

  console.log(result);
}

// Run the script
const txId = process.argv[2];
const publicKey = process.argv[3];
const solAmount = parseFloat(process.argv[4]);
const daysAmount = parseInt(process.argv[5], 10);

if (!txId || !publicKey || isNaN(solAmount) || isNaN(daysAmount)) {
  console.error(
    "Usage: tsx test-verifier.ts <txId> <publicKey> <solAmount> <daysAmount>",
  );
  process.exit(1);
}

testVerifier(txId, publicKey, solAmount, daysAmount)
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
