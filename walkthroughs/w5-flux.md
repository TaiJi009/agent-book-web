---
slug: w5-flux
order: 5
title: W5 · Flux：事件驱动的异步运行时
subtitle: 同步训练范式 vs 异步部署现实——取消式、队列式、并行式三种处理策略
project: chapter6/async-agent
chapters: [6]
summary: 事件如何按紧急度分流、打断如何安全落轨、批量事件如何不丢不乱。
---

## 分流器：紧急度决定命运

`_dispatcher` 是整个运行时的心脏。事件只在轮次边界被消费：打断类事件**取消式**（立刻打断当前 turn 并取消异步工具）；异步结果**批量式**（把积压的非紧急事件一并追加再触发 LLM）；普通输入在忙时**排队式**（累积到 pending，等下一个安全点批量处理）。

```ref
chapter6/async-agent/runtime.py 198-228
```

## 打断的安全落轨

打断不是简单掐断：取消 turn、取消后台工具、生成系统回执、清空积压并**留痕**，然后作为一批事件重新进入循环。同步 API 要求 assistant 与 tool 结果严格配对——未完成的工具用占位符补齐格式，LLM 看到的轨迹永远合法。

```ref
chapter6/async-agent/runtime.py 229-245
```

## 紧急度判定与批量注意力

事件分类由轻量规则完成（用户打断/系统告警为紧急，工具结果/定时器为常规）。批量事件还有一个隐蔽问题：模型只关注最后一条。解法是状态栏式标记——每条事件前加 `[未处理事件 k/n]` 并在末尾汇总，强制模型综合处理。

```ref
chapter6/async-agent/events.py 15-60
```

## 结构一图

```svg
<svg viewBox="0 0 340 110" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="38" rx="8" width="76" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="44" y="59" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">事件流</text>
<rect x="102" y="38" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="146" y="59" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">dispatcher</text>
<rect x="214" y="14" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="30" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">打断→取消+留痕</text>
<rect x="214" y="44" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="60" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">异步结果→批量</text>
<rect x="214" y="74" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="90" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">普通输入→排队</text>
<path d="M82 55h20" stroke="currentColor"/>
</svg>
```
