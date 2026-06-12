<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  id: number
  text: string
  done: boolean
}

const todos = ref<Todo[]>([])
const input = ref('')

const addTodo = () => {
  const text = input.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), text, done: false })
  input.value = ''
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter((t) => t.id !== id)
}
</script>

<template>
  <div class="container">
    <h1>📝 Vue TodoList</h1>
    <div class="input-row">
      <input
        v-model="input"
        placeholder="输入待办事项..."
        @keydown.enter="addTodo"
      />
      <button @click="addTodo">添加</button>
    </div>
    <ul class="list">
      <li v-for="todo in todos" :key="todo.id" class="item">
        <input type="checkbox" v-model="todo.done" />
        <span :class="{ done: todo.done }">{{ todo.text }}</span>
        <button class="del" @click="removeTodo(todo.id)">✕</button>
      </li>
    </ul>
    <p v-if="todos.length === 0" class="empty">暂无待办事项</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 480px;
  margin: 40px auto;
  font-family: sans-serif;
}
.input-row {
  display: flex;
  gap: 8px;
}
.input-row input {
  flex: 1;
  padding: 8px 12px;
  font-size: 16px;
}
.input-row button {
  padding: 8px 16px;
  font-size: 16px;
}
.list {
  list-style: none;
  padding: 0;
  margin-top: 16px;
}
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.item span {
  flex: 1;
  color: #333;
}
.item span.done {
  text-decoration: line-through;
  color: #999;
}
.del {
  color: red;
  border: none;
  background: none;
  cursor: pointer;
}
.empty {
  color: #999;
  text-align: center;
}
</style>
