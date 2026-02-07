import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(), // Stellar Address
  isAdmin: boolean("is_admin").default(false),
});

export const pools = pgTable("pools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Stellar Privacy Pool"
  asset: text("asset").notNull(), // e.g. "XLM", "USDC"
  apy: numeric("apy").notNull(), // e.g. "5.5"
  totalLiquidity: numeric("total_liquidity").notNull().default("0"),
  minCollateralRatio: numeric("min_collateral_ratio").notNull().default("150"), // 150%
});

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  amount: numeric("amount").notNull(),
  commitmentHash: text("commitment_hash").notNull(), // The "ZK" commitment
  isShielded: boolean("is_shielded").default(true),
  status: text("status").notNull().default("pending"), // pending, verified, withdrawn
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("active"), // active, repaid, liquidated
  collateralDepositId: integer("collateral_deposit_id").notNull(), // Link to the specific shielded deposit
  createdAt: timestamp("created_at").defaultNow(),
});

// Mock table for storing ZK Proof metadata
export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  depositId: integer("deposit_id").notNull(),
  proofData: text("proof_data").notNull(), // JSON string of the proof
  verified: boolean("verified").default(false),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  commitmentHash: true // Generated on server for MVP, or passed if advanced
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pool = typeof pools.$inferSelect;
export type Deposit = typeof deposits.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Proof = typeof proofs.$inferSelect;
