import { http, HttpResponse, delay } from 'msw'

// Dữ liệu mock cho demo
const mockTodos = [
  { id: 1, title: 'Tìm hiểu Vue Query lifecycle', completed: true },
  { id: 2, title: 'Thực hành staleTime và gcTime', completed: false },
  { id: 3, title: 'Demo optimistic update', completed: false },
  { id: 4, title: 'Kiểm tra retry logic', completed: false },
  { id: 5, title: 'Xây dựng cache inspector', completed: false },
]

const mockUsers = [
  { id: 1, name: 'Hoàng', email: 'hoang@example.com', role: 'admin' },
  { id: 2, name: 'Minh', email: 'minh@example.com', role: 'user' },
  { id: 3, name: 'Lan', email: 'lan@example.com', role: 'user' },
]

const mockPosts = [
  { id: 1, title: 'Bài viết về Vue Query', userId: 1, body: 'Nội dung bài viết...' },
  { id: 2, title: 'TanStack Table hướng dẫn', userId: 1, body: 'Nội dung hướng dẫn...' },
  { id: 3, title: 'Async State Management', userId: 2, body: 'Quản lý trạng thái bất đồng bộ...' },
]

export const handlers = [
  // --- Todos API ---
  http.get('/api/todos', async () => {
    await delay(500)
    return HttpResponse.json(mockTodos)
  }),

  http.get('/api/todos/:id', async ({ params }) => {
    await delay(300)
    const todo = mockTodos.find(t => t.id === Number(params.id))
    if (!todo) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(todo)
  }),

  http.post('/api/todos', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as { title: string }
    const newTodo = {
      id: mockTodos.length + 1,
      title: body.title,
      completed: false,
    }
    mockTodos.push(newTodo)
    return HttpResponse.json(newTodo, { status: 201 })
  }),

  http.patch('/api/todos/:id', async ({ params, request }) => {
    await delay(600)
    const body = (await request.json()) as Record<string, unknown>
    const index = mockTodos.findIndex(t => t.id === Number(params.id))
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockTodos[index] = { ...mockTodos[index], ...body } as (typeof mockTodos)[0]
    return HttpResponse.json(mockTodos[index])
  }),

  http.delete('/api/todos/:id', async ({ params }) => {
    await delay(400)
    const index = mockTodos.findIndex(t => t.id === Number(params.id))
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    mockTodos.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Users API ---
  http.get('/api/users', async () => {
    await delay(400)
    return HttpResponse.json(mockUsers)
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(300)
    const user = mockUsers.find(u => u.id === Number(params.id))
    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  // --- Posts API ---
  http.get('/api/posts', async () => {
    await delay(600)
    return HttpResponse.json(mockPosts)
  }),

  http.get('/api/posts/:id', async ({ params }) => {
    await delay(300)
    const post = mockPosts.find(p => p.id === Number(params.id))
    if (!post) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(post)
  }),

  // --- Generic endpoint cho API Explorer ---
  http.get('/api/echo', async ({ request }) => {
    await delay(500)
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    return HttpResponse.json({
      message: 'Echo response',
      params,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString(),
    })
  }),

  // --- Endpoint mô phỏng lỗi ---
  http.get('/api/error', async () => {
    await delay(300)
    return HttpResponse.json({ message: 'Lỗi server giả lập' }, { status: 500 })
  }),

  // --- Endpoint mô phỏng delay lâu ---
  http.get('/api/slow', async () => {
    await delay(3000)
    return HttpResponse.json({
      message: 'Response sau 3 giây',
      timestamp: new Date().toISOString(),
    })
  }),
]
