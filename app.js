// app.js - Karang Taruna
(() => {
  const STORAGE_KEY = 'todos-v1';
  const listEl = document.getElementById('todo-list');
  const inputEl = document.getElementById('new-todo');
  const addBtn = document.getElementById('add-btn');
  const remainingCountEl = document.getElementById('remaining-count');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let todos = [];
  let filter = 'all'; // all | active | completed

  // Utilities
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load todos:', e);
      todos = [];
    }
  }

  // CRUD operations
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.unshift({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleTodo(id) {
    const item = todos.find(t => t.id === id);
    if (item) {
      item.completed = !item.completed;
      save();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function editTodo(id, newText) {
    const item = todos.find(t => t.id === id);
    if (item) {
      item.text = newText.trim();
      save();
      render();
    }
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  }

  function remainingCount() {
    return todos.filter(t => !t.completed).length;
  }

  // Rendering
  function render() {
    // Apply filter
    const visible = todos.filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });

    // Clear list
    listEl.innerHTML = '';

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-item';
      empty.innerHTML = `<div class="left"><div class="todo-text" style="color:var(--muted)">No tasks — add one above</div></div>`;
      listEl.appendChild(empty);
    } else {
      visible.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.dataset.id = todo.id;

        li.innerHTML = `
          <div class="left">
            <button class="checkbox ${todo.completed ? 'checked' : ''}" aria-label="Toggle complete" title="Toggle complete">
              ${todo.completed ? '✓' : ''}
            </button>
            <div class="todo-text" tabindex="0" contenteditable="false">${escapeHtml(todo.text)}</div>
          </div>
          <div class="todo-actions">
            <button class="edit" title="Edit">✎</button>
            <button class="delete" title="Delete">🗑</button>
          </div>
        `;

        // Checkbox handler
        li.querySelector('.checkbox').addEventListener('click', () => toggleTodo(todo.id));

        // Delete handler
        li.querySelector('.delete').addEventListener('click', () => {
          if (confirm('Delete this task?')) deleteTodo(todo.id);
        });

        // Edit handler - toggle contentEditable
        const textEl = li.querySelector('.todo-text');
        const editBtn = li.querySelector('.edit');
        editBtn.addEventListener('click', () => {
          textEl.contentEditable = 'true';
          textEl.focus();
          // move caret to end
          document.execCommand('selectAll', false, null);
          document.getSelection().collapseToEnd();
        });

        // Save edits on blur or Enter
        textEl.addEventListener('blur', () => {
          if (textEl.contentEditable === 'true') {
            const newText = textEl.textContent || '';
            if (!newText.trim()) {
              // prevent empty todo; restore original
              textEl.textContent = todo.text;
            } else {
              editTodo(todo.id, newText);
            }
            textEl.contentEditable = 'false';
          }
        });

        textEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            textEl.blur();
          } else if (e.key === 'Escape') {
            // cancel edit
            textEl.textContent = todo.text;
            textEl.contentEditable = 'false';
            textEl.blur();
          }
        });

        listEl.appendChild(li);
      });
    }

    remainingCountEl.textContent = remainingCount();
    updateFilterButtons();
  }

  // Helpers
  function updateFilterButtons() {
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
      btn.setAttribute('aria-selected', btn.dataset.filter === filter ? 'true' : 'false');
    });
  }

  function escapeHtml(s) {
    return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  // Event bindings
  addBtn.addEventListener('click', () => {
    addTodo(inputEl.value);
    inputEl.value = '';
    inputEl.focus();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo(inputEl.value);
      inputEl.value = '';
    }
  });

  clearCompletedBtn.addEventListener('click', () => {
    if (confirm('Remove all completed tasks?')) clearCompleted();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  // Initialize
  load();
  render();

  // Expose for console debugging (optional)
  window.TodoApp = { get todos() { return todos; }, addTodo, clearCompleted, save };
})();
