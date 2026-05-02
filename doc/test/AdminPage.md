---
description: AdminPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、AuthContext 與狀態呈現、互動邏輯

---

## [x] 【前端元素】畫面應包含必要的標題、返回連結與登出按鈕
**範例輸入**：無
**期待輸出**：畫面成功渲染「返回」連結、「管理後台」標題、以及「登出」按鈕。

---

## [x] 【AuthContext 與狀態呈現】當角色為 admin 時應顯示管理員標籤
**範例輸入**：AuthContext 提供 `user: { role: 'admin' }`
**期待輸出**：畫面的角色標籤顯示為「管理員」，並且帶有 `admin` 的 className。

---

## [x] 【AuthContext 與狀態呈現】當角色非 admin 時應顯示一般用戶標籤
**範例輸入**：AuthContext 提供 `user: { role: 'user' }`
**期待輸出**：畫面的角色標籤顯示為「一般用戶」，並且帶有 `user` 的 className。

---

## [x] 【互動邏輯】點擊登出按鈕時應呼叫 logout 並導向 login 頁面
**範例輸入**：點擊「登出」按鈕
**期待輸出**：成功觸發 `logout()` 函數，並且呼叫 `navigate('/login', { replace: true, state: null })`。
