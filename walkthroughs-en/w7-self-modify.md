---
slug: w7-self-modify
order: 7
title: W7 · Propose, Verify, Canvass, Roll Back: an Agent Modifying Its Own Code
subtitle: Self-modification, converted into an auditable software release process
project: chapter9/self-modifying-agent
chapters: [9]
summary: The full chain from failure trajectories to minimal patches, AST-plus-behavior verification, and checklist-gated staged rollout.
---

## Diagnosis and proposal: from trajectory to minimal patch

`diagnose` aggregates similar failure trajectories to locate the root cause; `generate_candidate` produces a minimal diff patch on a **candidate branch** — never overwriting the running stable version. A patch is a minimal, sourced, individually revertible change.

```ref
chapter9/self-modifying-agent/evolution.py 62-120
```

## Dual verification: syntax gate + behavior gate

A candidate patch first passes AST static checks (syntactically valid, importable), then behavioral metrics: it must fix on the **boundary set** (the failure trajectories that triggered it) without regressing on the **holdout set** (normal trajectories). Testing only the former mistakes overfitting for progress; testing only the latter mistakes an ineffective change for a safe one.

```ref
chapter9/self-modifying-agent/evolution.py 203-245
```

## Release checklist and trusted root

Patches that pass verification enter checklist-gated staged rollout: what changed, expected behavior, rollback method, and evidence references are all written down. The critical design: **safety mechanisms cannot modify themselves** — the verifiers, release gates, and stable-version backups sit outside the proposer's authority. The agent may propose any patch; whether it ships is decided by mechanisms beyond the model.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="66" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="39" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Failures</text>
<rect x="86" y="28" rx="8" width="56" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="114" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Diagnose</text>
<rect x="156" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="191" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Patch</text>
<rect x="240" y="28" rx="8" width="94" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="287" y="49" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">AST+behavior gate</text>
<path d="M72 45h14m56 0h14m70 0h14" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">Stable version & verifiers outside the modifier's reach · staged, reversible</text>
</svg>
```
