
const username = sessionStorage.getItem("taskflowUsername");

// Protect the dashboard from direct access without a demo login
if (!username) {
    window.location.replace("/login.html");
} else {
    const avatar = document.getElementById("userAvatar");
    const displayUsername = document.getElementById("displayUsername");

    if (avatar) {
        avatar.textContent = username.charAt(0).toUpperCase();
    }

    if (displayUsername) {
        displayUsername.textContent = username;
    }
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("taskflowUsername");
        window.location.replace("/login.html");
    });
}

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");
const emptyMessage = document.getElementById("emptyMessage");

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Request failed");
    }

    return response.json();
}

async function loadTasks() {
    try {
        const tasks = await request("/api/tasks");
        renderTasks(tasks);
        updateStats(tasks);
        taskMessage.textContent = "";
    } catch (error) {
        taskMessage.textContent =
            "Could not load tasks. Please refresh the page.";
    }
}

function renderTasks(tasks) {
    taskList.replaceChildren();
    emptyMessage.hidden = tasks.length > 0;

    tasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-button";
        completeButton.type = "button";
        completeButton.textContent =
            task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", async () => {
            try {
                await request(`/api/tasks/${task.id}`, {
                    method: "PUT"
                });
                await loadTasks();
            } catch (error) {
                taskMessage.textContent = error.message;
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            try {
                await request(`/api/tasks/${task.id}`, {
                    method: "DELETE"
                });
                await loadTasks();
            } catch (error) {
                taskMessage.textContent = error.message;
            }
        });

        actions.append(completeButton, deleteButton);
        item.append(title, actions);
        taskList.appendChild(item);
    });
}

function updateStats(tasks) {
    const completed = tasks.filter(task => task.completed).length;

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent =
        tasks.length - completed;
}

taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = taskTitle.value.trim();

    if (!title) {
        taskMessage.textContent = "Please enter a task.";
        return;
    }

    try {
        await request("/api/tasks", {
            method: "POST",
            body: JSON.stringify({ title })
        });

        taskTitle.value = "";
        taskMessage.textContent = "";
        await loadTasks();
    } catch (error) {
        taskMessage.textContent = error.message;
    }
});

loadTasks();
