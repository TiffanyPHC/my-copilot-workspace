// 待辦清單的本地儲存鍵名稱
const TODOS_STORAGE_KEY = 'todo-list-data';
const THEME_STORAGE_KEY = 'todo-theme-mode';

// 取得待辦項目列表，若本地資料不存在則回傳空陣列
const loadTodos = () => {
  try {
    const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch (error) {
    console.error('讀取待辦資料失敗:', error);
    return [];
  }
};

// 將待辦項目存回 localStorage
const saveTodos = (todos) => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
};

// 取得 DOM 元素
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const todoSummary = document.querySelector('#todo-summary');
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeText = document.querySelector('.theme-text');
const filterButtons = document.querySelectorAll('.filter-btn');

// 目前的待辦資料與篩選狀態
let todos = loadTodos();
let currentFilter = 'all';

// 轉義 HTML，避免使用者輸入內容破壞 DOM
const escapeHtml = (value) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 依照篩選條件回傳顯示項目
const getFilteredTodos = () => {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
};

// 重新渲染待辦清單與統計資訊
const renderTodos = () => {
  const unfinishedCount = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = getFilteredTodos();

  // 若篩選後清單為空，顯示相對應的提示訊息
  if (visibleTodos.length === 0) {
    let emptyMessage = '還沒有任何待辦事項,新增一個吧!';

    if (currentFilter === 'active') {
      emptyMessage = '目前沒有未完成的待辦事項';
    } else if (currentFilter === 'completed') {
      emptyMessage = '目前沒有已完成的待辦事項';
    }

    todoList.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
  } else {
    todoList.innerHTML = visibleTodos
      .map(
        (todo) => `
          <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-main">
              <input
                class="todo-checkbox"
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                aria-label="標記為完成"
              />
              <span class="todo-text">${escapeHtml(todo.text)}</span>
            </div>
            <button class="delete-btn" type="button" aria-label="刪除待辦事項">刪除</button>
          </li>
        `,
      )
      .join('');
  }

  // 底部的未完成數字不受篩選影響，永遠顯示整體數量
  todoSummary.textContent = `未完成: ${unfinishedCount} 項`;
};

// 新增待辦事項
const addTodo = (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  // 若輸入空白內容則直接忽略
  if (!text) {
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: Date.now() + Math.random(),
    text,
    completed: false,
  };

  todos.unshift(newTodo);
  saveTodos(todos);
  todoInput.value = '';
  renderTodos();
  todoInput.focus();
};

// 切換待辦勾選狀態
const toggleTodo = (id) => {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos(todos);
  renderTodos();
};

// 刪除待辦事項
const deleteTodo = (id) => {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos(todos);
  renderTodos();
};

// 更新篩選狀態與按鈕樣式
const setFilter = (filterName) => {
  currentFilter = filterName;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderTodos();
};

// 設定主題，並保存使用者選擇到 localStorage
const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeText.textContent = '淺色模式';
    themeToggle.setAttribute('aria-label', '切換為淺色模式');
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = '深色模式';
    themeToggle.setAttribute('aria-label', '切換為深色模式');
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

// 若使用者尚未手動選擇主題，則根據作業系統設定來決定
const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 切換主題：使用者手動點擊後，會覆蓋自動模式
const toggleTheme = () => {
  const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
};

// 表單提交事件：新增待辦
 todoForm.addEventListener('submit', addTodo);

// 事件代理：處理勾選框與刪除按鈕點擊
 todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');
  const checkbox = event.target.closest('.todo-checkbox');

  if (deleteButton) {
    const item = deleteButton.closest('.todo-item');
    if (item) {
      deleteTodo(Number(item.dataset.id));
    }
  }

  if (checkbox) {
    const item = checkbox.closest('.todo-item');
    if (item) {
      toggleTodo(Number(item.dataset.id));
    }
  }
});

// 深色模式切換按鈕事件
 themeToggle.addEventListener('click', toggleTheme);

// 篩選按鈕事件
 filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

// 初始化畫面
const initializeTheme = () => {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);
};

initializeTheme();
renderTodos();
