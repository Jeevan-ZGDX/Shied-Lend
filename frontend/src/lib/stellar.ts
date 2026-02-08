import { SorobanRpc, Networks } from "@stellar/stellar-sdk";

// Horizon server for testnet
export const HORIZON = "https://horizon-testnet.stellar.org";

// Soroban RPC server for testnet
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

// Network passphrase
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Create Soroban server instance
export const server = new SorobanRpc.Server(SOROBAN_RPC_URL);

// Export constants
export const TESTNET = "TESTNET";
export const MAINNET = "MAINNET";
