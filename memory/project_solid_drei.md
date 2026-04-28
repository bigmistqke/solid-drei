---
name: solid-drei project context
description: Key facts about solid-drei — a SolidJS port of pmndrs/drei for solid-three
type: project
---

solid-drei is a SolidJS port of pmndrs/drei, authored by bigmistqke.

solid-three now uses continuous releases via pkg.pr.new. Latest known ref: https://pkg.pr.new/solid-three@5449e5a

**Why:** Avoids waiting for formal npm releases; can always pull the latest solid-three build.
**How to apply:** When updating solid-three dependency or testing against new solid-three APIs, use pkg.pr.new URLs instead of npm versions.

Unported files already use `solid-three/core` imports (partially translated from React). The task is completing them, not starting from scratch.
