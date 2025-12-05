const express = require('express');
const app = express();
const { Client } = require( "appwrite");
const dotenv = require('dotenv');
dotenv.config({path: '../.env' });
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) 
    .setProject(process.env.APPWRITE_PROJECT_ID); 

app.use(express.json()); // Add this line to parse JSON bodies
const callAgent = require('./agent').callAgent;
async function startServer() {
  try {
    // Set up basic Express route
    // curl -X GET http://localhost:3000/
    app.get('/', (req, res) => {
      res.send('LangGraph Agent Server');
    });

    // API endpoint to start a new conversation
    // curl -X POST -H "Content-Type: application/json" -d '{"message": "Build a team to make an iOS app, and tell me the talent gaps."}' http://localhost:3000/chat
    app.post('/chat', async (req, res) => {
      const initialMessage = req.body.message;
      const threadId = Date.now().toString(); // Simple thread ID generation
      try {
        const response = await callAgent(client, initialMessage, threadId);
        res.json({ threadId, response });
      } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // API endpoint to send a message in an existing conversation
    // curl -X POST -H "Content-Type: application/json" -d '{"message": "What team members did you recommend?"}' http://localhost:3000/chat/123456789
    app.post('/chat/:threadId', async (req, res) => {
      const { threadId } = req.params;
      const { message } = req.body;
      try {
        const response = await callAgent(client, message, threadId);
        res.json({ response });
      } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

startServer();