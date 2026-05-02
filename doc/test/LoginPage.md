---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、表單驗證邏輯、Mock API 與 狀態邏輯、AuthContext 整合

---

## [x] 【前端元素】畫面應包含必要的輸入框與按鈕
**範例輸入**：無
**期待輸出**：畫面成功渲染「電子郵件」輸入框、「密碼」輸入框以及「登入」按鈕。

---

## [x] 【表單驗證邏輯】Email 格式不正確時應顯示錯誤訊息
**範例輸入**：Email 輸入 `invalid-email`，點擊登入
**期待輸出**：Email 欄位下方顯示錯誤訊息「請輸入有效的 Email 格式」，且不會觸發登入 API。

---

## [x] 【表單驗證邏輯】密碼長度不足時應顯示錯誤訊息
**範例輸入**：Email 輸入 `test@example.com`，密碼輸入 `abc12` (小於8碼)，點擊登入
**期待輸出**：密碼欄位下方顯示錯誤訊息「密碼必須至少 8 個字元」，且不會觸發登入 API。

---

## [x] 【表單驗證邏輯】密碼未包含英數字時應顯示錯誤訊息
**範例輸入**：Email 輸入 `test@example.com`，密碼輸入 `12345678` (無英文) 或 `abcdefgh` (無數字)，點擊登入
**期待輸出**：密碼欄位下方顯示錯誤訊息「密碼必須包含英文字母和數字」，且不會觸發登入 API。

---

## [x] 【Mock API 與 狀態邏輯】送出表單時應顯示「登入中...」且停用輸入框
**範例輸入**：輸入正確格式的 Email 與密碼，點擊登入
**期待輸出**：按鈕文字變為「登入中...」，且 Email、密碼輸入框與登入按鈕均變為 disabled 狀態。

---

## [x] 【Mock API 與 狀態邏輯】登入失敗時應顯示 API 回傳的錯誤訊息
**範例輸入**：Mock API 模擬登入失敗 (回傳 401)，輸入帳號密碼並點擊登入
**期待輸出**：畫面上方的 Error Banner 顯示 API 回傳的錯誤訊息 (例如「登入失敗，請稍後再試」或自訂訊息)。

---

## [x] 【Mock API 與 狀態邏輯】登入成功時應導向至 dashboard
**範例輸入**：Mock API 模擬登入成功，輸入帳號密碼並點擊登入
**期待輸出**：成功觸發 `login` function，並且呼叫 `navigate('/dashboard', { replace: true })`。

---

## [x] 【AuthContext 整合】當 authExpiredMessage 有值時應顯示錯誤並清除訊息
**範例輸入**：AuthContext 提供 `authExpiredMessage: '您的登入已過期'`
**期待輸出**：畫面 Error Banner 顯示「您的登入已過期」，並且元件掛載後有呼叫 `clearAuthExpiredMessage()`。

---

## [x] 【AuthContext 整合】當已經登入時應自動導向 dashboard
**範例輸入**：AuthContext 提供 `isAuthenticated: true`
**期待輸出**：元件掛載後，直接呼叫 `navigate('/dashboard', { replace: true })`，不需重新登入。
