---
slug: w6-verifier
order: 6
title: W6 · The Three-Layer Trajectory Verifier
subtitle: Outcome, process, and quality signals — continual evolution starts with knowing which layer failed
project: chapter9/trajectory-verifier
chapters: [7, 9]
summary: The layered implementation of an environment-outcome verifier, a process-rules verifier, and an LLM rubric quality verifier.
---

## Bottom layer: the outcome verifier reads environment truth

`ResultVerifier` trusts only structured facts in the environment — order status, refund records, tool returns — never the model's own account. "The user says it's done" is trajectory-layer information; an actual record in the database is outcome-layer verification.

```ref
chapter9/trajectory-verifier/verifier.py 75-107
```

## Middle layer: the process verifier checks rules

`ProcessVerifier` checks policy compliance, privacy boundaries, and factual grounding item by item — plus the cleverest one, promise–action consistency: every promise the model makes to the user must have a matching tool call later. "We promised a 7-day refund" with no refund call is a false promise.

```ref
chapter9/trajectory-verifier/verifier.py 108-137
```

## Top layer: rubric and one-vote veto

Language and policy quality go to an evidence-based LLM Judge — but hallucination is a **one-vote veto**: full marks everywhere else still zeroes out. The division of labor across three layers lets failure attribution pinpoint "which layer, which step" went wrong — exactly the input format Chapter 9's continual-evolution loop consumes.

## The structure, in one diagram

```svg
<svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="28" rx="8" width="76" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="44" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Trajectory</text>
<rect x="106" y="8" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="23" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">Outcome · env truth</text>
<rect x="106" y="36" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="51" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">Process · rules</text>
<rect x="106" y="64" rx="8" width="104" height="22" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="158" y="79" text-anchor="middle" font-size="11" fill="currentColor" font-family="sans-serif">Quality · rubric</text>
<path d="M82 45h24" stroke="currentColor"/>
<rect x="240" y="28" rx="8" width="94" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="287" y="49" text-anchor="middle" font-size="12" fill="currentColor" font-family="sans-serif">Root cause</text>
<path d="M210 45h30" stroke="currentColor"/>
</svg>
```
