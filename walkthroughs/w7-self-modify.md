---
slug: w7-self-modify
order: 7
title: W7 · 提案—验证—灰度—回滚：Agent 修改自己的代码
subtitle: 自我修改被转化为可审计的软件发布流程
project: chapter9/self-modifying-agent
chapters: [9]
summary: 从故障轨迹生成补丁、AST 与行为双重验证、带清单灰度发布的完整链路。
---

## 诊断与提案：从轨迹到最小补丁

`diagnose` 聚合同类故障轨迹定位根因；`generate_candidate` 在**候选分支**上生成最小 diff 补丁——绝不覆盖运行中的稳定版本。补丁是带来源、可单独回滚的最小修改。

```ref
chapter9/self-modifying-agent/evolution.py 62-120
```

## 双重验证：语法门 + 行为门

候选补丁先过 AST 静态检查（语法合法、可导入），再跑行为指标：在**边界集**（触发失败的故障轨迹）上要修复，在**保留集**（正常轨迹）上不退化。只测前者会把过拟合当进步，只测后者会把无效修改当安全。

```ref
chapter9/self-modifying-agent/evolution.py 203-245
```

## 发布清单与可信根

通过验证的补丁进入带清单的灰度发布：修改内容、预期行为、回滚方式、证据引用逐项落盘。最关键的设计是**安全机制不可自我修改**——验证器、发布门槛、稳定版本备份位于修改提案者的权限之外，Agent 可以提任何补丁，"能不能上"由模型外的机制决定。

## 结构一图

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="66" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="39" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">故障轨迹</text>
<rect x="86" y="28" rx="8" width="56" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="114" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">诊断</text>
<rect x="156" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="191" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">候选补丁</text>
<rect x="240" y="28" rx="8" width="94" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="287" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">AST+行为门</text>
<path d="M72 45h14m56 0h14m70 0h14" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">稳定版本/验证器在修改权限之外 · 可灰度可回滚</text>
</svg>
```
