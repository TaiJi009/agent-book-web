---
slug: w5-flux
order: 5
title: W5 · Flux: an Event-Driven Async Runtime
subtitle: The synchronous training paradigm vs the asynchronous deployment reality — cancel, queue, and batch strategies for interruptions
project: chapter6/async-agent
chapters: [6]
summary: How events are routed by urgency, how interruptions land safely in the trajectory, and how batched events stay neither lost nor scrambled.
---

## The dispatcher: urgency decides fate

`_dispatcher` is the heart of the runtime. Events are consumed only at turn boundaries: interrupts are **cancel-style** (interrupt the current turn immediately and cancel async tools); async results are **batch-style** (append all backlogged non-urgent events at once, then trigger the LLM); ordinary input while busy is **queue-style** (accumulated into pending, processed in a batch at the next safe point).

```ref
chapter6/async-agent/runtime.py 198-228
```

## Landing an interruption safely

An interruption is not a blunt kill: cancel the turn, cancel background tools, emit a system receipt, flush the backlog and **leave a trace**, then re-enter the loop as one batch of events. The synchronous API requires strict assistant/tool pairing — unfinished tool calls are filled with placeholders so the trajectory the LLM sees is always valid.

```ref
chapter6/async-agent/runtime.py 229-245
```

## Urgency classification and batch attention

Event classification is done by lightweight rules (user interrupts and system alerts are urgent; tool results and timers are routine). Batched events have a subtle problem: the model attends mostly to the last item. The fix is a status-bar-style marker — prefix each event with `[unhandled event k/n]` and summarize at the end, forcing holistic treatment.

```ref
chapter6/async-agent/events.py 15-60
```

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 110" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="38" rx="8" width="76" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="44" y="59" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Events</text>
<rect x="102" y="38" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="146" y="59" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">dispatcher</text>
<rect x="214" y="14" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="30" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">interrupt → cancel+trace</text>
<rect x="214" y="44" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="60" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">async results → batch</text>
<rect x="214" y="74" rx="8" width="120" height="24" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="274" y="90" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">normal input → queue</text>
<path d="M82 55h20" stroke="currentColor"/>
</svg>
```
