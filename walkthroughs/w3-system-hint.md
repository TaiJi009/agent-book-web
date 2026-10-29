---
slug: w3-system-hint
order: 3
title: W3 · Agent 状态栏五件套
subtitle: 把分散在轨迹里的隐式状态提炼为显式知识——用 user 槽位注入而不破缓存
project: chapter2/system-hint
chapters: [2]
summary: 时间戳、工具计数器、TODO、详细错误、系统状态五项技术的实现与注入位置。
---

## 注入位置：借 user 角色的槽位

状态栏以 user 消息追加到上下文末尾，用标签包裹以便模型识别。为什么不用 system？因为改 system 消息会破坏整个前缀缓存。追加则只是新增一轮 token，前缀缓存持续命中。

```ref
chapter2/system-hint/agent.py 301-321
```

## 详细错误信息：四层结构

工具失败时返回错误类型、完整参数 JSON、调用栈与修复建议四层信息。启用后错误场景的替代方案成功率从 60% 升到 95%——反馈越结构化、越接近错误时刻，模型的自我纠正就越高效。

```ref
chapter2/system-hint/agent.py 510-528
```

## 两条纪律

其一，状态栏必须用**代码**维护：模型几乎无条件相信状态栏内容，LLM 自己做计数统计反而不可靠。其二，状态栏是有损投影：计数类任务可只留状态栏，但只要有一个问题超出预计算维度，仅保留状态栏会断崖式失准——谨慎删除原始上下文。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">轨迹/环境</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">代码统计</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">user 追加</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">前缀不动 · 末尾注入 · 模型无条件相信 → 必须代码维护</text>
</svg>
```
