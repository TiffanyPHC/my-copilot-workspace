// 待辦清單的本地儲存鍵名稱
const STORAGE_KEY = 'todo-list-data';

// 取得待辦項目列表，若本地資料不存在則回傳空陣列
const loadTodos = () => {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch (error) {
    console.error('讀取本地資料失敗:', error);
    return [];
  }
};

// 將待辦項目存回 localStorage
const saveTodos = (todos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

// 取得 DOM 元素
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const todoSummary = document.querySelector('#todo-summary');

// 目前的待辦資料
let todos = loadTodos();

// 重新渲染待辦清單與統計資訊
const renderTodos = () => {
  const unfinishedCount = todos.filter((todo) => !todo.completed).length;

  // 若清單為空，顯示提示文字
  if (todos.length === 0) {
    todoList.innerHTML = '<li class="empty-state">還沒有任何待辦事項,新增一個吧!</li>';
  } else {
    todoList.innerHTML = todos
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

  todoSummary.textContent = `未完成: ${unfinishedCount} 項`;
};

// 轉義 HTML，避免使用者輸入內容破壞 DOM
const escapeHtml = (value) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

// 初始化畫面
renderTodos();
