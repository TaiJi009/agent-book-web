---
slug: w8-cascade
order: 8
title: W8 · The Message Bus and Cascading Termination
subtitle: Ten parallel agents in a preemptive search — how "first verified success" settles
project: chapter10/parallel-web-research
chapters: [10]
summary: Envelope messages, subscribe-and-forward, interruptible worker waits, and cascading termination.
---

## The message bus: publish/subscribe decoupling

`MessageBus` does publish/subscribe with structured envelopes (sender, type, payload): workers never pass messages point-to-point; the Manager subscribes by type. Publishers don't know who consumes — adding a role only requires declaring a subscription, with zero changes to existing code.

```ref
chapter10/parallel-web-research/message_bus.py 92-130
```

## Interruptible worker waits

`_await_interruptibly` lets a worker wait on a page/LLM call while still responding to termination signals — cascading termination requires every worker to be gracefully stoppable at any time, not stuck inside an await. Live progress is reported through `status_update` events on the bus.

```ref
chapter10/parallel-web-research/agents.py 81-113
```

## Settlement: the first "verified" success

Once a worker reports the target found, the Manager broadcasts terminate to the rest and waits for acks — **graceful termination** cleans up resources before exiting; force only after timeout. Settlement must be idempotent (lock-protected): when two workers hit nearly simultaneously, only the first is accepted and the rest are ignored as duplicates. Failed workers are isolated; they never affect the others.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="10" rx="8" width="70" height="26" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="41" y="27" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">worker × N</text>
<rect x="120" y="31" rx="8" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="160" y="52" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Message bus</text>
<rect x="254" y="31" rx="8" width="80" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="294" y="52" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Manager</text>
<path d="M76 28l44 10m84 8h40" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">First verified success → broadcast terminate → await acks → idempotent settle</text>
</svg>
```
