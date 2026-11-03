---
slug: w1-react-loop
order: 1
title: W1 · The Minimal ReAct Loop: Evolution of the messages List
subtitle: The skeleton of every agent — what happens each round, what stays in the trajectory
project: chapter1/context
chapters: [1, 2]
summary: Walk the real main loop from the ablation suite round by round, watching messages grow from two entries to task completion.
---

## The loop skeleton: while + tool_calls

The minimal agent is a single while loop: send the full messages list to the model; if the reply carries tool_calls, execute them and append the results; if it is plain text, exit. Three invariants matter: every call carries the **entire history** (the API is stateless); assistant messages are **replayed verbatim** (the model must see its own earlier decisions); tool results are paired back through `tool_call_id`.

```ref
chapter1/context/main.py 150-229
```

## Ablation: remove any piece and it degrades

This loop is worth studying because `AblationTestSuite` systematically ablates five context components: remove tool definitions → the model cannot call tools; remove tool results → it falls into a blind loop; remove history → it repeats its mistakes; remove reasoning → it contradicts itself. **Context decides what the agent can see, and the agent can only act on what it sees.**

## Static prefix and KV Cache

The system prompt and tool definitions form the static prefix, byte-stable across the whole conversation; dynamic information is always appended at the end. In this loop, even one extra line — "current time" slipped into the system prompt — would invalidate the cache from scratch every round: latency and cost double, with zero functional gain.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 100" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">User msg</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">LLM decides</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Tool run</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/><path d="M290 62v20H50v-20" stroke="currentColor" fill="none"/>
<text x="170" y="96" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">Results append to messages · loop until no tool_calls</text>
</svg>
```
