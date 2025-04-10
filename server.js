const express = require('express');
const cors = require('cors');
const app = express();
const port = 11434; // Set your port to 11434

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS if you're calling the backend from a different port (like frontend running on 3000)

// Route handler for the /v1/chat/completions endpoint
app.post('/v1/chat/completions', (req, res) => {
  const { redFlag, question } = req.body;

  // Process the red flag and question here, mock example:
  const reply = `Here is the advice for the red flag: "${redFlag}". Answering the question: "${question}"`;

  res.json({ reply });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Root route handler
app.get('/', (req, res) => {
    res.send('Server is running');
  });
  