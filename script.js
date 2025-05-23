document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryFilter = document.getElementById('category-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    const taskDetailsForm = document.getElementById('task-details-form');
    const saveDetailsBtn = document.getElementById('save-details-btn');
    const cancelDetailsBtn = document.getElementById('cancel-details-btn');
    const editTaskText = document.getElementById('edit-task-text');
    const editTaskCategory = document.getElementById('edit-task-category');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const editTaskDueDate = document.getElementById('edit-task-due-date');
    const editTaskNotes = document.getElementById('edit-task-notes');

    let tasks = [];
    let currentFilter = 'all';
    let currentCategoryFilter = 'all';
    let currentPriorityFilter = 'all';
    let currentlyEditingId = null;

    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
        updateStats();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        totalTasksSpan.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        completedTasksSpan.textContent = `${completed} completed`;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active' && task.completed) return false;
            if (currentFilter === 'completed' && !task.completed) return false;
            if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;
            if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;
            return true;
        });
        
        if (!filteredTasks.length) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-info">
                    <span class="task-category">${task.category}</span>
                    ${task.dueDate ? `<span class="task-due-date ${isTaskOverdue(task) ? 'overdue' : ''}">${formatDate(new Date(task.dueDate))}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button title="Delete Task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskElement.querySelector('.task-checkbox').addEventListener('change', () => toggleTaskComplete(task.id));
            taskElement.querySelectorAll('.task-actions button')[0].addEventListener('click', () => openEditForm(task.id));
            taskElement.querySelectorAll('.task-actions button')[1].addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskElement);
        });
    }

    function isTaskOverdue(task) {
        if (task.completed || !task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;
        
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            category: 'personal',
            priority: 'medium',
            dueDate: '',
            notes: '',
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    function toggleTaskComplete(id) {
        tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        if (confirm('Delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    function openEditForm(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        currentlyEditingId = id;
        editTaskText.value = task.text;
        editTaskCategory.value = task.category;
        editTaskPriority.value = task.priority;
        editTaskDueDate.value = task.dueDate || '';
        editTaskNotes.value = task.notes || '';
        taskDetailsForm.style.display = 'block';
    }

    function saveTaskDetails() {
        const taskIndex = tasks.findIndex(t => t.id === currentlyEditingId);
        if (taskIndex === -1) return;
        
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            text: editTaskText.value.trim(),
            category: editTaskCategory.value,
            priority: editTaskPriority.value,
            dueDate: editTaskDueDate.value || null,
            notes: editTaskNotes.value.trim()
        };
        
        saveTasks();
        renderTasks();
        closeEditForm();
    }

    function closeEditForm() {
        taskDetailsForm.style.display = 'none';
        currentlyEditingId = null;
    }

    function clearCompletedTasks() {
        if (confirm('Clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    }

    function clearAllTasks() {
        if (confirm('Clear ALL tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    }

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    categoryFilter.addEventListener('change', () => {
        currentCategoryFilter = categoryFilter.value;
        renderTasks();
    });
    
    priorityFilter.addEventListener('change', () => {
        currentPriorityFilter = priorityFilter.value;
        renderTasks();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    saveDetailsBtn.addEventListener('click', saveTaskDetails);
    cancelDetailsBtn.addEventListener('click', closeEditForm);

    loadTasks();
    renderTasks();
});
        
