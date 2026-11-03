---
slug: w4-coding-agent
order: 4
title: W4 · Coding Agent: Seven Tools and Environment Awareness
subtitle: Dynamic environment injection and test-driven completion — software-engineering infrastructure naturally forms a Harness
project: chapter5/coding-agent
chapters: [5]
summary: Implementation notes on the run main loop, git state injection, and the dual-provider adapter.
---

## The main loop: iteration cap and environment injection

Each round of `run` injects environment state (working directory, git branch, unstaged changes) at the end of context. This information is not hardcoded into the system prompt — that would break the cache — it is generated live as a dynamic status bar.

```ref
chapter5/coding-agent/agent.py 122-181
```

## Git awareness: decide on current state

Four small functions form environment awareness: current branch, main-branch detection, change overview, recent commits. The value: the model knows which branch it is working on and what it has already changed — "environment awareness" grounds every decision in accurate state instead of stale assumptions.

```ref
chapter5/coding-agent/agent.py 85-121
```

## Completion criteria

The most common shortcut a coding agent takes is reporting done without running tests. Defining "tests pass" — not "code written" — as the completion standard is the Loop Engineering principle "the verifier decides when to stop" landed in the coding domain.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="41" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">git state</text>
<rect x="96" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="131" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Edit</text>
<rect x="186" y="28" rx="8" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="221" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Test</text>
<rect x="276" y="28" rx="8" width="58" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="305" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">pass?</text>
<path d="M76 45h20m70 0h20m70 0h20" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">Done = tests pass, not code written</text>
</svg>
```
