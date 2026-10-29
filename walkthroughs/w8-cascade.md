---
slug: w8-cascade
order: 8
title: W8 · 消息总线与级联终止
subtitle: 十个并行 Agent 抢占式搜索——"首个已验证成功"如何结算
project: chapter10/parallel-web-research
chapters: [10]
summary: 信封消息、订阅转发、worker 可中断等待与级联终止的实现。
---

## 消息总线：发布/订阅解耦

`MessageBus` 用结构化信封（发送者、类型、负载）做发布/订阅：worker 不点对点互传， Manager 按类型订阅。发布者不知道谁在消费——新增角色只需声明订阅，无需改动现有代码。

```ref
chapter10/parallel-web-research/message_bus.py 92-130
```

## 可中断的 worker 等待

`_await_interruptibly` 让 worker 在等待页面/LLM 的同时能响应终止信号——级联终止的前提是每个 worker 随时可被优雅叫停，而不是卡死在某个 await 上。实时进度通过总线上的 `status_update` 事件回报。

```ref
chapter10/parallel-web-research/agents.py 81-113
```

## 结算：第一个"已验证"成功

一个 worker 报告找到目标后，Manager 向其余 worker 广播 terminate 并等待 ack——**优雅终止**先清理资源再退出，超时才强制。结算必须幂等（锁保护）：两个 worker 几乎同时命中时，只有第一个被采信，其余按重复忽略。失败的 worker 隔离处理，不影响其他人。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="10" rx="8" width="70" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="41" y="27" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">worker × N</text>
<rect x="120" y="31" rx="8" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="160" y="52" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">消息总线</text>
<rect x="254" y="31" rx="8" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="294" y="52" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Manager</text>
<path d="M76 28l44 10m84 8h40" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">首个已验证成功 → 广播 terminate → 等 ack → 幂等结算</text>
</svg>
```
