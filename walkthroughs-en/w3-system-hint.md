---
slug: w3-system-hint
order: 3
title: W3 · The Agent Status Bar, Five Pieces
subtitle: Distill implicit state scattered across the trajectory into explicit knowledge — injected via a user slot without breaking the cache
project: chapter2/system-hint
chapters: [2]
summary: Implementation and injection points of five techniques: timestamp, tool counter, TODO, detailed errors, and system state.
---

## Injection point: borrow a user-role slot

The status bar is appended to the end of context as a user message, wrapped in tags the model can recognize. Why not system? Because mutating the system message would invalidate the entire prefix cache. Appending only adds one more round of tokens; the prefix cache keeps hitting.

```ref
chapter2/system-hint/agent.py 301-321
```

## Detailed error information: four layers

When a tool fails, return four layers: error type, full argument JSON, call stack, and a fix suggestion. With it enabled, the alternative-success rate on error scenarios jumped from 60% to 95% — the more structured and closer to the moment of failure the feedback is, the more efficiently the model self-corrects.

```ref
chapter2/system-hint/agent.py 510-528
```

## Two disciplines

First, the status bar must be maintained by **code**: the model trusts status-bar content almost unconditionally, and asking the LLM to count things itself is unreliable. Second, the status bar is a lossy projection: for counting tasks it can stand alone, but the moment one question falls outside the pre-computed dimensions, keeping only the status bar degrades cliff-sharply — remove raw context with care.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Trajectory</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Code-counted</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">user append</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">Prefix untouched · append at end · model trusts it blindly → keep it code-owned</text>
</svg>
```
