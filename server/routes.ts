import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertAccountSchema, 
  insertCategorySchema, 
  insertBudgetSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User route for demo/testing purposes
  app.post('/api/register', async (req, res) => {
    try {
      const user = await storage.createUser({
        username: req.body.username,
        password: req.body.password
      });
      
      // Never return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user' });
    }
  });
  
  // For this MVP, we'll use a fixed user ID for simplicity
  const userId = 1;
  
  // Accounts API
  app.get('/api/accounts', async (req, res) => {
    try {
      const accounts = await storage.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch accounts' });
    }
  });
  
  app.get('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch account' });
    }
  });
  
  app.post('/api/accounts', async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse({
        ...req.body,
        userId
      });
      
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid account data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create account' });
    }
  });
  
  app.put('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountSchema.partial().parse({
        ...req.body,
        userId
      });
      
      const account = await storage.updateAccount(id, validatedData);
      
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
      
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid account data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update account' });
    }
  });
  
  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAccount(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Account not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });
  
  // Categories API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });
  
  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });
  
  app.post('/api/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse({
        ...req.body,
        userId
      });
      
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid category data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create category' });
    }
  });
  
  app.put('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse({
        ...req.body,
        userId
      });
      
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid category data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update category' });
    }
  });
  
  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });
  
  // Transactions API
  app.get('/api/transactions', async (req, res) => {
    try {
      // Parse query parameters
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      
      if (req.query.accountId) {
        filters.accountId = parseInt(req.query.accountId as string);
      }
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      const transactions = await storage.getTransactions(userId, filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });
  
  app.get('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transaction' });
    }
  });
  
  app.post('/api/transactions', async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });
  
  app.put('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse({
        ...req.body,
        userId
      });
      
      const transaction = await storage.updateTransaction(id, validatedData);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update transaction' });
    }
  });
  
  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTransaction(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete transaction' });
    }
  });
  
  // Budgets API
  app.get('/api/budgets', async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      const budgets = await storage.getBudgets(userId, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch budgets' });
    }
  });
  
  app.get('/api/budgets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudget(id);
      
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch budget' });
    }
  });
  
  app.post('/api/budgets', async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse({
        ...req.body,
        userId
      });
      
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid budget data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create budget' });
    }
  });
  
  app.put('/api/budgets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBudgetSchema.partial().parse({
        ...req.body,
        userId
      });
      
      const budget = await storage.updateBudget(id, validatedData);
      
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid budget data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update budget' });
    }
  });
  
  app.delete('/api/budgets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBudget(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete budget' });
    }
  });
  
  // Financial summary API
  app.get('/api/financial-summary', async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      const summary = await storage.getFinancialSummary(userId, month, year);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch financial summary' });
    }
  });
  
  app.get('/api/expenses-by-category', async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      const categoryExpenses = await storage.getExpensesByCategory(userId, month, year);
      res.json(categoryExpenses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch expenses by category' });
    }
  });
  
  app.get('/api/monthly-overview', async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      
      const overview = await storage.getMonthlyOverview(userId, month, year);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch monthly overview' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
