# Token 刷新机制修复

## 目标
修复 OPC Hub 的 refresh token rotation 机制——旧 token 未被正确作废。

## 根因
LowDB v7 的 `db.data` 是 Proxy 对象。通过 `user.refreshTokens = ...`（`user` 是 `db.data.users.find()` 返回的引用）赋值时，Proxy 的 set trap 未能正确追踪变更，导致 `db.write()` 写入时旧 token 仍保留在文件中。

## 修复方案
所有 refreshTokens 的增删操作改为通过 `db.data.users[idx]` 路径直接赋值：
- `/auth/register`: `db.data.users[rIdx].refreshTokens.push(...)`
- `/auth/login`: `db.data.users[lIdx].refreshTokens.push(...)`
- `/auth/refresh`: `db.data.users[userIdx].refreshTokens.filter(...) + push(...)`
- `/auth/logout`: `db.data.users[userIdx].refreshTokens.filter(...)`

## 验证结果
三步测试全部通过：
1. RT1 刷新 → 成功，返回 RT2 ✅
2. 旧 RT1 重用 → 403 "refresh token 已失效" ✅
3. 新 RT2 使用 → 成功 ✅

Commit: `525510d`
