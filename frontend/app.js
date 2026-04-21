const API_URL = "http://localhost:3000/tasks";

// ADD TASK
document.getElementById("addTask").addEventListener("click", async () => {
    const input = document.getElementById("task-input");
    const taskText = input.value;

    if (!taskText.trim()) return;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: taskText })
        });

        const data = await res.json();

        const li = document.createElement("li");
        li.className = "row border border-dark border-2 rounded p-1 align-items-center mb-2";
        li.dataset.id = data.id;

        li.innerHTML = `
            <div class="col-12 col-sm-8 mb-2 mb-sm-0 task-text">
                ${data.title}
            </div>
            <div class="col-6 col-sm-2">
                <button class="btn btn-primary text-white w-100 done-btn">Done</button>
            </div>
            <div class="col-6 col-sm-2">
                <button class="btn btn-danger text-white w-100 del-btn">Delete</button>
            </div>
        `;

        document.getElementById("task-list").appendChild(li);
        input.value = "";

    } catch (err) {
        console.error("Error creando tarea:", err);
    }
});


// DELETE + DONE (EVENT DELEGATION)
document.addEventListener("click", async (e) => {

    // DELETE
    if (e.target.classList.contains("del-btn")) {
        const li = e.target.closest("li");
        const id = li.dataset.id;

        try {
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            li.remove();
        } catch (err) {
            console.error("Error eliminando:", err);
        }
    }

    // DONE / UNDONE
    if (e.target.classList.contains("done-btn")) {
        const btn = e.target;
        const li = btn.closest("li");
        const text = li.querySelector(".task-text");
        const id = li.dataset.id;

        const isDone = btn.classList.contains("btn-primary");

        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: isDone })
            });

            if (isDone) {
                btn.classList.replace("btn-primary", "btn-secondary");
                btn.textContent = "Undone";
                text.style.textDecoration = "line-through";
                text.style.opacity = "0.6";
            } else {
                btn.classList.replace("btn-secondary", "btn-primary");
                btn.textContent = "Done";
                text.style.textDecoration = "none";
                text.style.opacity = "1";
            }

        } catch (err) {
            console.error("Error actualizando:", err);
        }
    }
});