require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // Import ObjectId
const WebSocket = require("ws");

const PORT = process.env.PORT || 5000;
// const wss = new WebSocket.Server({ port: 3000 });

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yz4tz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("TaskManager");
    const tasksCollection = db.collection("tasks");

    console.log("✅ Connected to MongoDB!");


    // Create a task
    app.post("/tasks", async (req, res) => {
        const taskData = req.body;
        const task = await tasksCollection.insertOne(taskData);
        res.send(task);
      });
    // Get all tasks for a user
    app.get("/tasks", async (req, res) => {
        const tasks = await tasksCollection.find().toArray();
        res.send(tasks);
    });

    

    // Update a task
    app.put("/:id", async (req, res) => {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.send(updatedTask);
    });

    // Delete a task
    app.delete("/:id", async (req, res) => {
      await Task.findByIdAndDelete(req.params.id);
      res.send();
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("my assignments 12 is running");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
