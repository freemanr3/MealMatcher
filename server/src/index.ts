import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5179',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Mock user data
const mockUser = {
  id: "1",
  budget: 100,
  ingredients: ["chicken", "rice", "tomatoes"],
  dietaryPreferences: ["vegetarian"]
};

// Routes
app.get('/api/users/:id', (req, res) => {
  res.json(mockUser);
});

app.patch('/api/users/:id/budget', (req, res) => {
  const { budget } = req.body;
  mockUser.budget = budget;
  res.json(mockUser);
});

app.patch('/api/users/:id/ingredients', (req, res) => {
  const { ingredients } = req.body;
  mockUser.ingredients = ingredients;
  res.json(mockUser);
});

app.patch('/api/users/:id/preferences', (req, res) => {
  const { preferences } = req.body;
  mockUser.dietaryPreferences = preferences;
  res.json(mockUser);
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
