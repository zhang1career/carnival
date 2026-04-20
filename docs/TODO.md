# TODO

面向「平台型端应用」（电商、内容流、直播等）的缺口清单，**按重要性排序**。实现程度以当前仓库 `mobile/` 为准。

## 1. 登录态持久化与安全存储

- **已实现**：`expo-secure-store` 持久化 access + refresh；`AuthHydrationGate` 冷启动水合；`sessionLifecycle`（`applySession` / `clearSession`）；刷新成功后写回新 token（随后端双 token 返回与 rotation）。

## 2. 真实交易闭环：下单 API、支付、订单状态

- `checkout` 仍为占位：需对接 **创建订单**、库存预占/释放、**支付渠道**（微信/支付宝/Apple Pay/卡等）、支付结果回调与 **订单状态机**。

## 3. 购物车与库存、价格的服务端一致

- 购物车目前仅本地 `zustand`；需与后端 **库存、促销价、锁价** 等对齐，处理结算失败与多端同步。

## 4. 鉴权韧性：401、静默刷新、后台刷新

- 订单等接口遇 401 会抛错，需 **全局策略**（如刷新 token、避免并发惊群、失败再登出）。
- **后台 token 刷新**（见下节）：仅前台 `setInterval` 不可靠，需原生侧或推送等方案。

## 5. Feed / 内容流后端化

- `listFeed` 仍走 mock；若产品包含发现页/社区流，需 **真实 Feed API**、分页、富媒体与审核等（按产品裁剪）。

## 6. 直播 / 实时音视频

- 仅有未接入页面的点播向 `VideoPlayer`（expo-av）；直播需 **推拉流、房间、信令、IM/礼物** 等，通常依赖 **第三方 SDK + 服务端**，单独立项。

## 7. 消息与触达

- **推送**（订单、支付、开播等）或应用内消息；与第 4 节「静默刷新触发」可协同设计。

## 8. 用户中心与履约

- Profile 较薄；按需补充 **地址簿**、售后/退款入口、优惠券、收藏、设置（语言、通知）等。

## 9. 工程与交付

- 环境说明、CI（lint/类型/构建）、关键路径 **E2E**、崩溃与性能监控等与现网运维衔接。

---

## Auth / session（已有说明）

- **Background token refresh**: The app refreshes access tokens on a timer (`TOKEN_REFRESH_INTERVAL_MS`) only while it is **foregrounded**; the OS may throttle or pause `setInterval` in the background. To renew tokens when the app is backgrounded or not running, plan **native** mechanisms (e.g. silent **push** to trigger refresh, **iOS** `BGAppRefreshTask` / `BGProcessingTask`, **Android** `WorkManager`), plus security and product review.
