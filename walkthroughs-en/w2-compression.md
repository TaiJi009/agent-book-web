---
slug: w2-compression
order: 2
title: W2 · Six Context Compression Strategies
subtitle: Compression is not "compress when it overflows" — summarized knowledge is often more usable than the raw form
project: chapter2/context-compression
chapters: [2]
summary: A six-arm comparison on one research task: implementation details of cutting tokens by 75%, from no compression to contextual compression.
---

## Strategy dispatch: one Compressor, six strategies

`ContextCompressor` is a minimal strategy-pattern implementation: the strategy is fixed at construction, invisible to callers. The no-compression arm hits the 128K overflow guard in round five — tens of thousands of characters of raw search results blow the window in a few rounds. That is compression's first motivation (length and cost).

```ref
chapter2/context-compression/compression_strategies.py 62-132
```

## Context-aware: carry query intent into the compression prompt

Task-agnostic compression summarizes the text in isolation and cannot tell what is relevant; contextual compression injects the current query and the information accumulated so far into the prompt, making "which facts will matter for future steps" part of the compression decision. Measured: compression rate ~3.0%, token reduction above 75%, and key facts like founder role changes survive.

```ref
chapter2/context-compression/compression_strategies.py 454-500
```

## Engineering details: dedup and citations

Two details easy to miss: compressed content gets a `[COMPRESSED]` marker and is never processed again (re-compressing loses information exponentially); the citations arm keeps a source URL per fact — content lossy, index lossless, always traceable. Compression happens **between two API calls**; the static prefix is never touched. That is the prerequisite for compression and KV Cache to coexist.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="50" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Raw results</text>
<rect x="126" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="170" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Intent-aware</text>
<rect x="246" y="28" rx="8" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="290" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">[COMPRESSED]</text>
<path d="M94 45h32m60 0h60" stroke="currentColor"/>
<text x="170" y="88" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">Query intent in prompt · threshold-triggered · batch · dedup</text>
</svg>
```
