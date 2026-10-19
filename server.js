
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Open the login page first
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve HTML, CSS and JavaScript files
app.use(express.static(path.join(__dirname, "public")));

let tasks = [];
let nextId = 1;

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
    const title = String(req.body.title || "").trim();

    if (!title) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const task = {
        id: nextId++,
        title,
        completed: false
    };

    tasks.push(task);
    res.status(201).json(task);
});

// Complete or undo a task
app.put("/api/tasks/:id", (req, res) => {
    const task = tasks.find(
        item => item.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.completed = !task.completed;
    res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const taskExists = tasks.some(
        item => item.id === Number(req.params.id)
    );

    if (!taskExists) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks = tasks.filter(
        item => item.id !== Number(req.params.id)
    );

    res.json({ message: "Task deleted" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
