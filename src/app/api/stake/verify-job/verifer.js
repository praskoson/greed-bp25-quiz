import { signature } from "@solana/kit";
import { createClient, VALIDATOR_VOTE_ACCOUNT, CUSTODIAN } from "@/lib/solana";
import { env } from "@/env";

const STAKE_PROGRAM_ID = "Stake11111111111111111111111111111111111111";
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";

/**
 * @typedef {Object} ValidationParams
 * @property {string} expectedOwner - The expected owner of the stake account
 * @property {bigint} expectedLamportsAmount - The expected amount of lamports
 * @property {number} expectedDurationSeconds - The expected lock duration in seconds
 */

/**
 * Validates a Solana stake transaction by checking createAccount, initialize, and delegate instructions
 * @param {string} txSignature - The transaction signature to validate
 * @param {ValidationParams} params - The validation parameters
 * @returns {Promise<{success: true, stakeAccount: string}>} The validation result with stake account address
 * @throws {Error} If validation fails or transaction is not found
 */
export async function validateStakeTransaction(txSignature, params) {
  const { expectedOwner, expectedLamportsAmount, expectedDurationSeconds } =
    params;

  const client = createClient();
  const response = await client.rpc
    .getTransaction(signature(txSignature), {
      encoding: "jsonParsed",
      maxSupportedTransactionVersion: 0,
    })
    .send();

  if (!response) {
    throw new Error("Transaction not found");
  }

  const instructions = response.transaction.message.instructions;

  // Step 1: Find and validate createAccount instruction
  const createAccountIx = instructions.find(
    (ix) =>
      ix.programId === SYSTEM_PROGRAM_ID &&
      "parsed" in ix &&
      ix.parsed?.type === "createAccount",
  );

  if (!createAccountIx || !("parsed" in createAccountIx)) {
    throw new Error("Validation failed: createAccount instruction not found");
  }

  const createInfo = createAccountIx.parsed.info;

  // Validate lamports
  if (createInfo?.lamports !== expectedLamportsAmount) {
    throw new Error(
      `Validation failed: createAccount lamports mismatch. Expected ${expectedLamportsAmount}, got ${createInfo.lamports}`,
    );
  }

  // Validate source (owner)
  if (createInfo?.source !== expectedOwner) {
    throw new Error(
      `Validation failed: createAccount source mismatch. Expected ${expectedOwner}, got ${createInfo.source}`,
    );
  }

  // Validate owner is stake program
  if (createInfo?.owner !== STAKE_PROGRAM_ID) {
    throw new Error(
      `Validation failed: createAccount owner is not stake program. Expected ${STAKE_PROGRAM_ID}, got ${createInfo.owner}`,
    );
  }

  // Save the new stake account pubkey
  const newStakeAccount = createInfo?.newAccount;

  // Step 2: Find and validate initialize instruction
  const initializeIx = instructions.find(
    (ix) =>
      ix.programId === STAKE_PROGRAM_ID && ix.parsed?.type === "initialize",
  );

  if (!initializeIx) {
    throw new Error("Validation failed: initialize instruction not found");
  }

  const initInfo = initializeIx.parsed.info;

  // Validate stake account matches
  if (initInfo.stakeAccount !== newStakeAccount) {
    throw new Error(
      `Validation failed: initialize stakeAccount mismatch. Expected ${newStakeAccount}, got ${initInfo.stakeAccount}`,
    );
  }

  // Validate staker authority
  if (initInfo.authorized.staker !== expectedOwner) {
    throw new Error(
      `Validation failed: initialize staker authority mismatch. Expected ${expectedOwner}, got ${initInfo.authorized.staker}`,
    );
  }

  // Validate withdrawer authority
  if (initInfo.authorized.withdrawer !== expectedOwner) {
    throw new Error(
      `Validation failed: initialize withdrawer authority mismatch. Expected ${expectedOwner}, got ${initInfo.authorized.withdrawer}`,
    );
  }

  if (env.NEXT_PUBLIC_ENABLE_LOCKUP) {
    // Validate lockup
    if (!initInfo?.lockup) {
      throw new Error(`Validation failed: lockup not found.`);
    }

    if (initInfo?.lockup?.custodian !== CUSTODIAN.toString()) {
      throw new Error(
        `Validation failed: initialize lockup custodian mismatch. Expected ${CUSTODIAN.toString()}, got ${initInfo.lockup.custodian}`,
      );
    }

    if (typeof initInfo?.lockup?.unixTimestamp !== "bigint") {
      throw new Error(
        `Validation failed: lockup unixTimestamp is not a bigint.`,
      );
    }

    const lockupTimestamp = Number(initInfo?.lockup?.unixTimestamp);
    if (
      !validateUnlockTime(
        Number(response.blockTime),
        expectedDurationSeconds,
        lockupTimestamp,
      )
    ) {
      throw new Error(
        `Validation failed: unlock unixTimestamp not valid, tx blockTime: ${response.blockTime.toString()}, expected duration: ${expectedDurationSeconds}, actual unlock timestamp: ${lockupTimestamp}`,
      );
    }
  }

  // Step 3: Find and validate delegate instruction
  const delegateIx = instructions.find(
    (ix) => ix.programId === STAKE_PROGRAM_ID && ix.parsed?.type === "delegate",
  );

  if (!delegateIx) {
    throw new Error("Validation failed: delegate instruction not found");
  }

  const delegateInfo = delegateIx.parsed.info;

  // Validate stake account matches
  if (delegateInfo.stakeAccount !== newStakeAccount) {
    throw new Error(
      `Validation failed: delegate stakeAccount mismatch. Expected ${newStakeAccount}, got ${delegateInfo.stakeAccount}`,
    );
  }

  // Validate vote account
  if (delegateInfo.voteAccount !== VALIDATOR_VOTE_ACCOUNT) {
    throw new Error(
      `Validation failed: delegate voteAccount mismatch. Expected ${VALIDATOR_VOTE_ACCOUNT}, got ${delegateInfo.voteAccount}`,
    );
  }

  // All validations passed
  return {
    success: true,
    stakeAccount: newStakeAccount,
  };
}

/**
 * Check the timestamps
 * @param {number} start - unix timestamp
 * @param {number} expectedLockTime - number of locked seconds
 * @param {number} actualUnlockTimestamp - the actual unlock time from the transaction
 * @returns {boolean} - true if the unlock time is within the expected range, false otherwise
 */
function validateUnlockTime(start, expectedLockTime, actualUnlockTimestamp) {
  const expectedUnlockTimestamp = start + expectedLockTime;
  const timeDifference = Math.abs(
    actualUnlockTimestamp - expectedUnlockTimestamp,
  );
  const twelveHoursInSeconds = 12 * 60 * 60; // 43200 seconds

  return timeDifference <= twelveHoursInSeconds;
}
