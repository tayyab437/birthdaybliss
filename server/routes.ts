import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API routes prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);
  
  // GET all messages
  apiRouter.get("/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // GET a single message by ID
  apiRouter.get("/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  
  // POST a new message
  apiRouter.post("/messages", async (req, res) => {
    try {
      // Validate request body using zod schema
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Create message in storage
      const newMessage = await storage.createMessage(validatedData);
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
