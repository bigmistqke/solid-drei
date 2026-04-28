---
name: Code style - if blocks
description: Always use multi-line if blocks, never single-line
type: feedback
---

Always use multi-line if blocks:

```ts
if (condition) {
  statement
}
```

Never single-line:
```ts
if (condition) statement
```

**Why:** User preference for readability.
**How to apply:** Every if statement, even single-line bodies.
