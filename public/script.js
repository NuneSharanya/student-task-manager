let tasks = [];

/* -------------------------------
   Load Tasks
-------------------------------- */

async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        tasks = await response.json();

        displayTasks();
        updateStatistics();

    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}


/* -------------------------------
   Display Tasks
-------------------------------- */

function displayTasks() {

    const list = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    const searchText =
        document.getElementById("searchInput").value.toLowerCase();

    const filter =
        document.getElementById("filterInput").value;

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (filter === "pending") {
            matchesFilter = !task.completed;
        }

        if (filter === "completed") {
            matchesFilter = task.completed;
        }

        if (
            filter === "High" ||
            filter === "Medium" ||
            filter === "Low"
        ) {
            matchesFilter =
                getPriority(task.id) === filter;
        }

        return matchesSearch && matchesFilter;
    });

    list.innerHTML = "";

    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filteredTasks.forEach(task => {

        const priority = getPriority(task.id);
        const category = getCategory(task.id);

        const li = document.createElement("div");

        li.className = "task-item";

        li.innerHTML = `
            <div class="task-info">

                <button
                    class="check-button ${task.completed ? "completed" : ""}"
                    onclick="completeTask(${task.id})"
                >
                    ${task.completed ? "✓" : ""}
                </button>

                <div>

                    <div class="task-title ${
                        task.completed ? "completed-text" : ""
                    }">
                        ${escapeHTML(task.title)}
                    </div>

                    <div class="task-meta">

                        <span class="badge ${getPriorityClass(priority)}">
                            ${getPriorityIcon(priority)} ${priority}
                        </span>

                        <span class="badge category">
                            ${getCategoryIcon(category)} ${category}
                        </span>

                        <span class="badge category">
                            📅 Today
                        </span>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button
                    onclick="editTask(${task.id})"
                    title="Edit"
                >
                    ✏️
                </button>

                <button
                    onclick="completeTask(${task.id})"
                    title="Complete"
                >
                    ${task.completed ? "↩️" : "✅"}
                </button>

                <button
                    onclick="deleteTask(${task.id})"
                    title="Delete"
                >
                    🗑️
                </button>

            </div>
        `;

        list.appendChild(li);
    });
}


/* -------------------------------
   Add Task
-------------------------------- */

async function addTask() {

    const input =
        document.getElementById("taskInput");

    const priority =
        document.getElementById("priorityInput").value;

    const category =
        document.getElementById("categoryInput").value;

    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task.");
        input.focus();
        return;
    }

    try {

        const response = await fetch("/api/tasks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add task");
        }

        const newTask = await response.json();

        localStorage.setItem(
            `priority_${newTask.id}`,
            priority
        );

        localStorage.setItem(
            `category_${newTask.id}`,
            category
        );

        input.value = "";

        await loadTasks();

    } catch (error) {

        console.error("Error adding task:", error);

        alert("Unable to add task.");
    }
}


/* -------------------------------
   Complete / Undo Task
-------------------------------- */

async function completeTask(id) {

    try {

        const response = await fetch(
            `/api/tasks/${id}`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        await loadTasks();

    } catch (error) {

        console.error(
            "Error completing task:",
            error
        );
    }
}


/* -------------------------------
   Delete Task
-------------------------------- */

async function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/api/tasks/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        localStorage.removeItem(
            `priority_${id}`
        );

        localStorage.removeItem(
            `category_${id}`
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );
    }
}


/* -------------------------------
   Edit Task
-------------------------------- */

async function editTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) {
        return;
    }

    const newTitle =
        prompt("Edit task:", task.title);

    if (
        newTitle === null ||
        newTitle.trim() === ""
    ) {
        return;
    }

    try {

        // Delete old task
        await fetch(`/api/tasks/${id}`, {
            method: "DELETE"
        });

        // Create updated task
        const response =
            await fetch("/api/tasks", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: newTitle.trim()
                })
            });

        const newTask =
            await response.json();

        // Keep previous priority
        const priority =
            getPriority(id);

        // Keep previous category
        const category =
            getCategory(id);

        localStorage.setItem(
            `priority_${newTask.id}`,
            priority
        );

        localStorage.setItem(
            `category_${newTask.id}`,
            category
        );

        localStorage.removeItem(
            `priority_${id}`
        );

        localStorage.removeItem(
            `category_${id}`
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "Error editing task:",
            error
        );
    }
}


/* -------------------------------
   Statistics
-------------------------------- */

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const pending =
        total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    document.getElementById(
        "totalTasks"
    ).textContent = total;

    document.getElementById(
        "pendingTasks"
    ).textContent = pending;

    document.getElementById(
        "completedTasks"
    ).textContent = completed;

    document.getElementById(
        "progressPercent"
    ).textContent = `${percentage}%`;

    document.getElementById(
        "progressText"
    ).textContent = `${percentage}%`;

    document.getElementById(
        "progressFill"
    ).style.width = `${percentage}%`;
}


/* -------------------------------
   Priority
-------------------------------- */

function getPriority(id) {

    return (
        localStorage.getItem(
            `priority_${id}`
        ) || "Medium"
    );
}


function getPriorityClass(priority) {

    if (priority === "High") {
        return "priority-high";
    }

    if (priority === "Low") {
        return "priority-low";
    }

    return "priority-medium";
}


function getPriorityIcon(priority) {

    if (priority === "High") {
        return "🔴";
    }

    if (priority === "Low") {
        return "🟢";
    }

    return "🟡";
}


/* -------------------------------
   Category
-------------------------------- */

function getCategory(id) {

    return (
        localStorage.getItem(
            `category_${id}`
        ) || "Assignment"
    );
}


function getCategoryIcon(category) {

    const icons = {
        Assignment: "📚",
        Project: "💻",
        Exam: "📝",
        Personal: "👤"
    };

    return icons[category] || "📌";
}


/* -------------------------------
   Filters
-------------------------------- */

function setFilter(value) {

    document.getElementById(
        "filterInput"
    ).value = value;

    displayTasks();
}


function showAllTasks() {

    setFilter("all");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -------------------------------
   Focus Add Task
-------------------------------- */

function focusTaskInput() {

    const input =
        document.getElementById("taskInput");

    input.focus();

    input.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* -------------------------------
   Dark Mode
-------------------------------- */

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        darkMode
    );
}


function loadDarkMode() {

    const darkMode =
        localStorage.getItem("darkMode");

    if (darkMode === "true") {
        document.body.classList.add("dark");
    }
}


/* -------------------------------
   Security Helper
-------------------------------- */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* -------------------------------
   Initialize Application
-------------------------------- */

loadDarkMode();
loadTasks();