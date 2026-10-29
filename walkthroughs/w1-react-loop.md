---
slug: w1-react-loop
order: 1
title: W1 · 最小 ReAct 循环：messages 列表的演化
subtitle: 一切 Agent 的骨架——每一轮发生了什么、轨迹里留了什么
project: chapter1/context
chapters: [1, 2]
summary: 用消融实验套件里的真实主循环，逐轮看 messages 如何从两条增长到任务完成。
---

## 循环骨架：while + tool_calls 判断

Agent 的最小实现只有一个 while 循环：把完整 messages 列表发给模型，返回带 tool_calls 就执行并追加结果，返回纯文本就退出。注意三个不变式：每次调用都带**完整历史**（API 无状态）；assistant 消息**原样回放**（模型要看到自己之前的决策）；tool 结果通过 `tool_call_id` 配对。

```ref
chapter1/context/main.py 150-229
```

## 消融：去掉任何一块都会退化

这个循环之所以值得讲，是因为 `AblationTestSuite` 对上下文五个组件做了系统消融：去掉工具定义→无法调用工具；去掉工具结果→陷入盲目循环；去掉历史→重复犯错；去掉 reasoning→前后矛盾。**上下文决定了 Agent 能看到什么，而 Agent 只能基于它看到的信息做决策。**

## 静态前缀与 KV Cache

系统提示词与工具定义构成静态前缀，整轮对话中保持字节级稳定；动态信息一律追加到末尾。循环实现里哪怕多一行"当前时间"插进系统提示词，都会让每轮的缓存从头失效——延迟与成本翻倍，而功能毫无增益。

## 结构一图

```svg
<svg viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">用户消息</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">LLM 决策</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">工具执行</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/><path d="M290 62v20H50v-20" stroke="currentColor" fill="none"/>
<text x="170" y="96" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">结果追加进 messages · 循环直到无 tool_calls</text>
</svg>
```
