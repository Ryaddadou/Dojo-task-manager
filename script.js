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

    function init() {
        loadTasks();
        renderTasks();
        setupEventListeners();
    }

    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        updateStats();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    }

    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        totalTasksSpan.textContent = ${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'};
        completedTasksSpan.textContent = ${completedTasks} completed;
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
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No tasks found. Add a new task!</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = task-item ${task.priority}-priority ${task.completed ? 'completed' : ''};
        li.dataset.id = task.id;
        
        const checkbox = document.createElement('input');

checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = task-text ${task.completed ? 'completed' : ''};
        taskText.textContent = task.text;
        
        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        
        const categorySpan = document.createElement('span');
        categorySpan.className = 'task-category';
        categorySpan.textContent = task.category;
        
        let dueDateText = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            dueDateText = formatDate(dueDate);
            
            if (!task.completed && dueDate < today) {
                dueDateText += ' (Overdue)';
            }
        }
        
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = task-due-date ${isTaskOverdue(task) ? 'overdue' : ''};
        dueDateSpan.textContent = dueDateText;
        
        taskInfo.appendChild(categorySpan);
        taskInfo.appendChild(dueDateSpan);
        
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Task';
        editBtn.addEventListener('click', () => openEditForm(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(taskInfo);
        li.appendChild(taskActions);
        
        return li;
    }

    function isTaskOverdue(task) {
        if (task.completed || !task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return dueDate < today;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
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
        const id = currentlyEditingId;
        const taskIndex = tasks.findIndex(t => t.id === id);
        
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
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    }

    function clearAllTasks() {
        if (confirm('Are you sure you want to clear ALL tasks? This cannot be undone.')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    }

    function setupEventListeners() {
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
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
    }

    init();
});