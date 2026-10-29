---
slug: w4-coding-agent
order: 4
title: W4 · Coding Agent：七工具与环境感知
subtitle: 环境信息动态注入、测试驱动完成判定——软件工程基础设施天然构成 Harness
project: chapter5/coding-agent
chapters: [5]
summary: run 主循环、git 状态注入、双 provider 适配的实现要点。
---

## 主循环：迭代上限与环境注入

`run` 方法每一轮把环境状态（工作目录、git 分支、未暂存变更）注入末尾。这些信息不硬编码进系统提示词——那会破坏缓存——而是作为动态状态栏实时生成。

```ref
chapter5/coding-agent/agent.py 122-181
```

## git 感知：让决策基于当前状态

四个小函数构成环境感知：当前分支、主分支判定、变更概览、最近提交。价值在于模型知道自己在哪个分支上工作、已经改了什么——"环境感知"让每个决策基于准确状态而非过时假设。

```ref
chapter5/coding-agent/agent.py 85-121
```

## 完成判定

Coding Agent 最常见的偷懒是写完不跑测试就报告完成。把"测试通过"而非"代码写完"定义为完成标准，是 Loop 工程"由验证器判定何时可停"原则在编码场景的落地。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="41" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">git 状态</text>
<rect x="96" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="131" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">编辑</text>
<rect x="186" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="221" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">测试</text>
<rect x="276" y="28" rx="8" width="58" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="305" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">通过?</text>
<path d="M76 45h20m70 0h20m70 0h20" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">完成标准 = 测试通过，而非代码写完</text>
</svg>
```
