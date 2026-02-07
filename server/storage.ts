import { db } from "./db";
import {
  users, pools, deposits, loans, proofs,
  type User, type InsertUser,
  type Pool,
  type Deposit,
  type Loan,
  type Proof
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Pools
  getPools(): Promise<Pool[]>;
  getPool(id: number): Promise<Pool | undefined>;
  createPool(pool: Partial<Pool>): Promise<Pool>; // For seeding

  // Deposits
  createDeposit(deposit: any): Promise<Deposit>;
  getDepositsByUserId(userId: number): Promise<Deposit[]>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  updateDepositStatus(id: number, status: string): Promise<Deposit>;

  // Loans
  createLoan(loan: any): Promise<Loan>;
  getLoansByUserId(userId: number): Promise<Loan[]>;

  // Proofs
  createProof(proof: any): Promise<Proof>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Pools
  async getPools(): Promise<Pool[]> {
    return await db.select().from(pools);
  }

  async getPool(id: number): Promise<Pool | undefined> {
    const [pool] = await db.select().from(pools).where(eq(pools.id, id));
    return pool;
  }

  async createPool(poolData: Partial<Pool>): Promise<Pool> {
    const [pool] = await db.insert(pools).values(poolData as any).returning();
    return pool;
  }

  // Deposits
  async createDeposit(deposit: any): Promise<Deposit> {
    const [newDeposit] = await db.insert(deposits).values(deposit).returning();
    return newDeposit;
  }

  async getDepositsByUserId(userId: number): Promise<Deposit[]> {
    return await db.select().from(deposits).where(eq(deposits.userId, userId));
  }
  
  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit;
  }

  async updateDepositStatus(id: number, status: string): Promise<Deposit> {
    const [deposit] = await db.update(deposits)
      .set({ status })
      .where(eq(deposits.id, id))
      .returning();
    return deposit;
  }

  // Loans
  async createLoan(loan: any): Promise<Loan> {
    const [newLoan] = await db.insert(loans).values(loan).returning();
    return newLoan;
  }

  async getLoansByUserId(userId: number): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.userId, userId));
  }

  // Proofs
  async createProof(proofData: any): Promise<Proof> {
    const [proof] = await db.insert(proofs).values(proofData).returning();
    return proof;
  }
}

export const storage = new DatabaseStorage();
