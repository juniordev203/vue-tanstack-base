# 🚀 Vue Query Dev Dashboard

## 1. Overview

**Vue Query Dev Dashboard** là một ứng dụng web được xây dựng bằng Vue 3 + TypeScript + Tailwind + TanStack Query nhằm mục đích:

- Visualize và debug async state
- Phân tích cache behavior của TanStack Query
- Thử nghiệm các chiến lược staleTime, cacheTime
- Mô phỏng network condition
- Kiểm tra optimistic update và rollback

Đây không phải CRUD app thông thường, mà là một **DevTool-style dashboard** tập trung vào async architecture.

---

## 2. Tech Stack

- Vue 3 (Composition API)
- TypeScript (strict mode)
- Vite
- TailwindCSS
- TanStack Query (Vue Query)
- TanStack Table
- Vue Router
- MSW (Mock Service Worker) – fake API
- Optional: ECharts / Chart.js (analytics)

---

## 3. Core Objectives

### 🎯 Mục tiêu chính

- Hiểu sâu lifecycle của query
- Quản lý cache nâng cao
- Trực quan hóa async state
- Thực hành optimistic update
- Thực hành retry & error handling

---

## 4. Main Features

---

# 🔹 4.1 Query Manager

### Mô tả

Trang hiển thị toàn bộ query hiện có trong cache.

### Hiển thị:

| Query Key | Status | Observers | Stale | Data Size | Last Updated | Actions |
| --------- | ------ | --------- | ----- | --------- | ------------ | ------- |

### Actions:

- Refetch
- Invalidate
- Remove
- Toggle Enabled
- Inspect Data

### Technical Highlights:

- `queryClient.getQueryCache()`
- Subscribe query cache
- Derive query state
- Track observers count

---

# 🔹 4.2 API Explorer

### Mô tả

Cho phép nhập:

- Endpoint
- Query params
- Headers
- staleTime
- retry count

Click fetch → tạo dynamic query.

### Features:

- Dynamic queryKey
- Cache per endpoint
- Manual staleTime control
- Toggle background refetch

### Technical Highlights:

- Dynamic query factory
- Generic fetch wrapper
- Controlled query behavior

---

# 🔹 4.3 Mutation Lab

### Mô tả

Trang thử nghiệm mutation behavior.

### Demo:

- Optimistic update
- Rollback khi error
- Retry logic
- Mutation state timeline

### Hiển thị timeline:
