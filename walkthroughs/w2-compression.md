---
slug: w2-compression
order: 2
title: W2 · 六种上下文压缩策略
subtitle: 压缩不是"塞不下才压"——总结后的知识比原始形式更利于模型使用
project: chapter2/context-compression
chapters: [2]
summary: 同一个研究任务上的六臂对照：从无压缩到上下文感知压缩，token 减少 75% 的实现细节。
---

## 策略分发：一个 Compressor，六种策略

`ContextCompressor` 是策略模式的最小实现：构造时选定策略，调用方无感知。无压缩臂会在第五轮触发 128K 溢出保护——数万字符的搜索原始结果几轮就撑爆窗口，这就是压缩要解决的第一动机（长度与成本）。

```ref
chapter2/context-compression/compression_strategies.py 62-132
```

## 上下文感知：把查询意图带进压缩提示

非任务感知压缩只对原文独立摘要，无法区分信息相关性；上下文感知压缩在提示中注入当前查询与已积累信息，让"哪些事实对未来步骤有用"成为压缩决策的一部分。实测：压缩率约 3.0%，token 减少 75% 以上，且保留创始人职位变动等关键事实。

```ref
chapter2/context-compression/compression_strategies.py 454-500
```

## 工程细节：防重复与引用

两处容易漏掉的细节：已压缩内容打 `[COMPRESSED]` 标记永不被重复处理（重复压缩会指数损失信息）；带引用臂给每条事实保留来源 URL——内容有损、索引无损，随时可回溯。压缩发生在**两次 API 调用之间**，静态前缀永远不动，这是压缩与 KV Cache 共存的前提。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">原始结果</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">带意图压缩</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">[COMPRESSED]</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">查询意图进提示 · 阈值触发 · 批量压缩 · 防重复</text>
</svg>
```
