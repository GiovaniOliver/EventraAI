import { Express, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer } from 'ws';

// Simplified auth middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  // In a real app, we'd check req.isAuthenticated() from passport
  // For now, we'll just pass through
  next();
}

export async function registerRoutes(app: Express) {
  // Initialize WebSocket server
  const httpServer = createServer(app);
  
  // Set up WebSocket server with a specific path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws-api' 
  });
    
  // Set up WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
    
    // Send a welcome message
    ws.send(JSON.stringify({ 
      type: 'connection', 
      message: 'Connected to EventraAI WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });
  
  // Only add a fallback root route handler if we're not in development mode
  if (process.env.NODE_ENV === 'production') {
    // Add a simple welcome page for the root path in production only
    app.get('/', (req: Request, res: Response) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EventraAI</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                line-height: 1.6;
              }
              h1 { color: #2563eb; }
              .card {
                background: #f9fafb;
                border-radius: 8px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border: 1px solid #e5e7eb;
              }
              .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                text-decoration: none;
                margin-right: 0.5rem;
              }
            </style>
          </head>
          <body>
            <h1>EventraAI Server</h1>
            <div class="card">
              <h2>Welcome to EventraAI</h2>
              <p>The server is running successfully!</p>
              <a href="/api/health" class="button">Check API Health</a>
            </div>
            <div class="card">
              <h3>Server Information</h3>
              <p>Server Time: ${new Date().toLocaleString()}</p>
              <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
          </body>
        </html>
      `);
    });
  }
  
  // Basic health check route
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      message: "Server is running with Supabase",
      timestamp: new Date().toISOString()
    });
  });
  
  // Add a catch-all route for API requests that weren't handled
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  return httpServer;
}
