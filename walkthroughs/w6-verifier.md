---
slug: w6-verifier
order: 6
title: W6 · 三层轨迹验证器
subtitle: 结果、过程、质量三层信号——持续进化的前提是知道错在哪一层
project: chapter9/trajectory-verifier
chapters: [7, 9]
summary: 环境结果验证器、过程规则验证器、LLM Rubric 质量验证器的分层实现。
---

## 底层：结果验证器读环境真值

`ResultVerifier` 只相信环境里的结构化事实——订单状态、退款记录、工具返回——绝不采信模型自述。"用户说办好了"是轨迹层信息，数据库里真有记录才是结果层验证。

```ref
chapter9/trajectory-verifier/verifier.py 75-107
```

## 中层：过程验证器查规则

`ProcessVerifier` 逐条检查政策遵从、隐私边界、事实锚定，以及最巧妙的一项——承诺-行动一致性：模型对用户的每个承诺，都要能在后续工具调用里找到对应动作。"承诺退款 7 天到账"却没有退款调用，就是虚假承诺。

```ref
chapter9/trajectory-verifier/verifier.py 108-137
```

## 上层：Rubric 与一票否决

语言与策略质量交给带证据的 LLM Judge，但幻觉是**一票否决项**——其他维度全满分也归零。三层信号的分工让失败归因能定位到"哪一层、哪一步"出错，这正是第九章持续进化闭环的输入格式。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="76" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="44" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">轨迹</text>
<rect x="106" y="8" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="23" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">结果层·环境真值</text>
<rect x="106" y="36" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="51" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">过程层·规则</text>
<rect x="106" y="64" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="79" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">质量层·Rubric</text>
<path d="M82 45h24" stroke="currentColor"/>
<rect x="240" y="28" rx="8" width="94" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="287" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">失败归因</text>
<path d="M210 45h30" stroke="currentColor"/>
</svg>
```
