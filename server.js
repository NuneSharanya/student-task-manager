const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let tasks = [];

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
    const task = {
        id: Date.now(),
        title: req.body.title,
        completed: false
    };

    tasks.push(task);
    res.status(201).json(task);
});

// Complete / undo task
app.put("/api/tasks/:id", (req, res) => {
    const task = tasks.find(
        t => t.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.completed = !task.completed;
    res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    tasks = tasks.filter(
        t => t.id !== Number(req.params.id)
    );

    res.json({
        message: "Task deleted"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});