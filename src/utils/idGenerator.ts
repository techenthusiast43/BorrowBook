import { keccak256, toHex } from "viem";

/**
 * Generates a collision-resistant bytes32 loan ID.
 * Incorporates caller address, current timestamp, random entropy, and a sequence.
 */
export function generateLoanId(creatorAddress?: string): `0x${string}` {
  const timestamp = Date.now().toString();
  const randomEntropy = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const rawInput = `${creatorAddress || "borrowbook"}-${timestamp}-${randomEntropy}`;
  return keccak256(toHex(rawInput));
}

/**
 * Converts a string into a bytes32 hex if it fits, or hashes it.
 */
export function formatBytes32Id(input: string): `0x${string}` {
  const trimmed = input.trim();
  if (trimmed.startsWith("0x") && trimmed.length === 66) {
    return trimmed as `0x${string}`;
  }
  return keccak256(toHex(trimmed));
}
