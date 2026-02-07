import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Simple Session Setup
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: "privacy-pool-secret",
    })
  );

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      (req.session as any).userId = user.id;
      res.status(201).json({ id: user.id, username: user.username });
    } catch (e) {
        res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    const input = api.auth.login.input.parse(req.body);
    const user = await storage.getUserByUsername(input.username);
    if (!user || user.password !== input.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    (req.session as any).userId = user.id;
    res.json({ id: user.id, username: user.username });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.user.path, async (req, res) => {
    if (!(req.session as any).userId) return res.json(null);
    const user = await storage.getUser((req.session as any).userId);
    if (!user) return res.json(null);
    res.json({ id: user.id, username: user.username, walletAddress: user.walletAddress });
  });

  // Pool Routes
  app.get(api.pools.list.path, async (req, res) => {
    const pools = await storage.getPools();
    res.json(pools);
  });

  app.get(api.pools.get.path, async (req, res) => {
    const pool = await storage.getPool(Number(req.params.id));
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    res.json(pool);
  });

  // Deposit Routes
  app.post(api.deposits.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.deposits.create.input.parse(req.body);
      const userId = (req.session as any).userId;
      
      // Simulate commitment hash generation
      const commitmentHash = "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
      
      const deposit = await storage.createDeposit({
        ...input,
        userId,
        commitmentHash,
        status: "pending"
      });
      res.status(201).json(deposit);
    } catch (e) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.get(api.deposits.list.path, requireAuth, async (req, res) => {
    const userId = (req.session as any).userId;
    const deposits = await storage.getDepositsByUserId(userId);
    res.json(deposits);
  });

  app.post(api.deposits.verify.path, requireAuth, async (req, res) => {
      const depositId = Number(req.params.id);
      const deposit = await storage.getDeposit(depositId);
      if (!deposit) return res.status(404).json({ message: "Deposit not found" });

      // Simulate ZK Verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await storage.updateDepositStatus(depositId, "verified");
      
      // Create proof record
      await storage.createProof({
          depositId,
          proofData: JSON.stringify({ a: [], b: [], c: [], input: [] }), // Mock ZK proof
          verified: true
      });

      res.json({ verified: true, proofHash: "0xzk" + Math.random().toString(16).slice(2) });
  });


  // Loan Routes
  app.post(api.loans.create.path, requireAuth, async (req, res) => {
    try {
        const input = api.loans.create.input.parse(req.body);
        const userId = (req.session as any).userId;

        // Check if collateral is valid/verified
        const deposit = await storage.getDeposit(input.collateralDepositId);
        if (!deposit || deposit.userId !== userId) {
            return res.status(400).json({ message: "Invalid collateral" });
        }
        if (deposit.status !== "verified") {
             return res.status(400).json({ message: "Collateral must be verified (ZK Proof required) before borrowing" });
        }

        const loan = await storage.createLoan({
            ...input,
            userId,
            status: "active"
        });
        res.status(201).json(loan);
    } catch (e) {
        res.status(400).json({ message: "Validation error" });
    }
  });

  app.get(api.loans.list.path, requireAuth, async (req, res) => {
      const userId = (req.session as any).userId;
      const loans = await storage.getLoansByUserId(userId);
      res.json(loans);
  });

  // SEED DATA
  const pools = await storage.getPools();
  if (pools.length === 0) {
      console.log("Seeding pools...");
      await storage.createPool({
          name: "Stellar Privacy Pool (XLM)",
          asset: "XLM",
          apy: "5.5",
          totalLiquidity: "5000000",
          minCollateralRatio: "150"
      });
      await storage.createPool({
          name: "USDC Shielded Pool",
          asset: "USDC",
          apy: "8.2",
          totalLiquidity: "2500000",
          minCollateralRatio: "120"
      });
  }

  return httpServer;
}
