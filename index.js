require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // Import ObjectId
const WebSocket = require("ws");

const PORT = process.env.PORT || 5000;
// const wss = new WebSocket.Server({ port: 3000 });

const corsOptions = {
  origin: ["http://localhost:5173","https://scic-assignment1.web.app"],
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
    // await client.connect();
    const db = client.db("TaskManager");
    const tasksCollection = db.collection("tasks");
    const newTasksCollection = db.collection("newTasks");
    const userCollection = db.collection("users");

    // console.log("✅ Connected to MongoDB!");

    // Get Users
    app.get("/users", async (req, res) => {
      const findUsers = userCollection.find({});
      const result = await findUsers.toArray();
      res.send(result);
    });

    // Post A User
    app.post("/user", async (req, res) => {
      // console.log(req.body);
      const userInfo = req.body;
      const id = { userID: userInfo.userID };
      const existedUser = await userCollection.findOne(id);

      if (existedUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }

      const insertResult = await userCollection.insertOne(userInfo);
      res.send(insertResult);
    });

    // Create a task
    app.post("/tasks", async (req, res) => {
      const taskData = req.body;
      const task = await tasksCollection.insertOne(taskData);
      res.send(task);
    });
    // Create a anotherTasks
    app.post("/anotherTasks", async (req, res) => {
      const taskData = req.body;
      const task = await newTasksCollection.insertOne(taskData);
      res.send(task);
    });
    // Get all tasks for a user
    app.get("/anotherTasks", async (req, res) => {
      const tasks = await newTasksCollection.find().toArray();
      res.send(tasks);
    });
    // Get all tasks for a user
    app.get("/tasks", async (req, res) => {
      const tasks = await tasksCollection.find().toArray();
      res.send(tasks);
    });

    // get a single job data by id from db
    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });
    // get a single job data by id from db
    app.get("/newTasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newTasksCollection.findOne(query);
      res.send(result);
    });

    // Update draggable content of Task
    app.put("/newTasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const { Category, newIndex } = req.body;

      const task = await newTasksCollection.findOne(query);
      if (!task) {
        return res.status(404).send({ message: "Task not found" });
      }

      const tasksInCategory = await newTasksCollection
        .find({ Category })
        .sort({ index: 1 })
        .toArray();

      // Remove the moved task from its old position
      const filteredTasks = tasksInCategory.filter(
        (t) => t._id.toString() !== id
      );

      // Insert the task at its new position
      filteredTasks.splice(newIndex, 0, task);

      // Update the index of all tasks in the category
      for (let i = 0; i < filteredTasks.length; i++) {
        await newTasksCollection.updateOne(
          { _id: new ObjectId(filteredTasks[i]._id) },
          { $set: { index: i } }
        );
      }

      const updateTask = {
        $set: { Category, index: newIndex },
      };

      // Update the moved task's category and index
      const updateResult = await newTasksCollection.updateOne(
        query,
        updateTask
      );
      res.send(updateResult);
    });
    // Delete a newTask
    app.delete("/deleteTasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newTasksCollection.deleteOne(query);
      res.send(result);
    });
    app.put("/newDataTasks/:id", async (req, res) => {
      const id = req.params.id;
      const maraData = req.body;
      const updated = {
        $set: maraData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await newTasksCollection.updateOne(
        query,
        updated,
        options
      );
      // console.log(result);
      res.send(result);
    });

    // Update a task
    app.put("/taskData/:id", async (req, res) => {
      const id = req.params.id;
      const maraData = req.body;
      const updated = {
        $set: maraData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await tasksCollection.updateOne(query, updated, options);
      // console.log(result);
      res.send(result);
    });

    // Delete a task
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
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
