import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getDb, createTransaction, getTransactionsByUser, deleteTransaction } from "./db";
import type { InsertTransaction } from "../drizzle/schema";

describe("Transactions DB Functions", () => {
  const testUserId = 999;
  let createdTransactionId: number | null = null;

  beforeAll(async () => {
    // Ensure database is initialized
    await getDb();
  });

  it("should create a transaction", async () => {
    const transactionData: InsertTransaction = {
      userId: testUserId,
      date: new Date(),
      month: 2,
      year: 2026,
      type: "egreso",
      categoryId: 1,
      conceptId: 1,
      amount: 50000, // 500.00 in cents
      content: "Test transaction",
      comment: "This is a test",
    };

    const result = await createTransaction(transactionData);
    expect(result).toBeDefined();
  });

  it("should retrieve transactions by user", async () => {
    const transactions = await getTransactionsByUser(testUserId);
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    const testTransaction = transactions.find((t) => t.content === "Test transaction");
    if (testTransaction) {
      createdTransactionId = testTransaction.id;
      expect(testTransaction.userId).toBe(testUserId);
      expect(testTransaction.type).toBe("egreso");
      expect(testTransaction.amount).toBe(50000);
    }
  });

  it("should filter transactions by type", async () => {
    const egressTransactions = await getTransactionsByUser(testUserId, {
      type: "egreso",
    });

    expect(Array.isArray(egressTransactions)).toBe(true);
    egressTransactions.forEach((t) => {
      expect(t.type).toBe("egreso");
    });
  });

  it("should filter transactions by month and year", async () => {
    const transactions = await getTransactionsByUser(testUserId, {
      month: 2,
      year: 2026,
    });

    expect(Array.isArray(transactions)).toBe(true);
    transactions.forEach((t) => {
      expect(t.month).toBe(2);
      expect(t.year).toBe(2026);
    });
  });

  it("should delete a transaction", async () => {
    if (!createdTransactionId) {
      throw new Error("No transaction ID to delete");
    }

    const result = await deleteTransaction(createdTransactionId, testUserId);
    expect(result).toBeDefined();

    // Verify deletion
    const transactions = await getTransactionsByUser(testUserId);
    const deletedTransaction = transactions.find((t) => t.id === createdTransactionId);
    expect(deletedTransaction).toBeUndefined();
  });
});
