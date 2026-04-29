# solid-drei → SolidJS v2 Migration Design

**Date:** 2026-04-29  
**Branch:** `solid-drei-2` (git worktree)  
**Target:** solid-three `next-solid-2` branch + SolidJS v2

---

## Goal

Port solid-drei to work with the `next-solid-2` branch of solid-three, which targets SolidJS v2 (beta.9). The solid-three public API is largely unchanged; the primary work is updating solid-drei's own code to the SolidJS v2 API.

---

## Dependency Changes

| Package | Old | New |
|---|---|---|
| `solid-three` | `https://pkg.pr.new/solid-three@5449e5a` | `https://pkg.pr.new/solid-three@51` |
| `solid-js` | `^1.8.18` | `2.0.0-beta.9` |
| `@solidjs/web` | — | add as devDep |

---

## SolidJS v2 Breaking Changes Affecting This Codebase

| Change | Impact |
|---|---|
| `createEffect(fn)` → `createEffect(compute, effect)` | 232 uses, widespread |
| `createResource` removed → async `createSignal`/`createMemo` | 43 uses, 19 files |
| `createSignal(expr)` → `createSignal(() => expr)` for computed inits | 106 uses, selective |
| `<For>` index/value both become accessors | 12 files |
| `createComputed` removed → use `createRenderEffect` | 22 uses |
| `when`/`every` utilities → eliminate via async signals | ~162 uses |

`children()`, `onCleanup`, `onMount`, `on()`, `createMemo`, `createRenderEffect`, `useContext`, `createContext`, `splitProps`, `mergeProps`, `untrack` are unchanged.

---

## Migration Phases

### Phase 1 — Trivial renames (mechanical)

**`createComputed` → `createRenderEffect`** (22 files)  
Pure rename. No semantic change needed — `createRenderEffect` is the direct replacement.

**`<For>` accessor callbacks** (12 files)  
Both `index` and `value` parameters become accessors. Wrap usages: `value` → `value()`, `index` → `index()` inside each `<For>` callback body.

### Phase 2 — `createEffect` compute/effect split (232 uses)

Every `createEffect(fn)` becomes `createEffect(compute, effect)`:
- The `compute` callback does the reactive tracking and returns a value.
- The `effect` callback receives that value and runs the side effect (DOM writes, three.js mutations, etc.).
- If the entire body is reactive tracking with no separable side effect, the logic stays in `compute` and `effect` can be omitted or empty.

Work file-by-file through the 134 affected files. The split is usually obvious: reactive reads go in `compute`, imperative mutations go in `effect`.

### Phase 3 — `createResource` → async signal/memo (19 files)

`createResource` is removed. Replace with:
- `createSignal(async () => value)` when the result needs a setter (mutable).
- `createMemo(async () => value)` when the result is derived and read-only.

Async signals/memos throw when accessed before the async function resolves, making existing `<Suspense>` boundaries work as-is. Files without `<Suspense>` that could be accessed pre-load need a `<Suspense>` wrapper added.

**19 affected files:**
`useLoader.ts`, `useGLTF.tsx`, `useFBX.tsx`, `useFont.tsx`, `useCubeTexture.tsx`,
`useMatcapTexture.tsx`, `useDreiNormalTexture.tsx`, `useVideoTexture.tsx`,
`useDetectGPU.tsx`, `PositionalAudio.tsx`, `Svg.tsx`, `Text.tsx`,
`SpriteAnimator.tsx`, `FaceControls.tsx`, `FaceLandmarker.tsx`,
`ScreenVideoTexture.tsx`, `WebcamVideoTexture.tsx`,
`unported/FaceControls.tsx`, `unported/FaceLandmarker.tsx`

### Phase 4 — `when`/`every` elimination (~162 uses)

Audit each `when`/`every` usage:
- `when(signal, fn)` guarding an async signal access → remove the guard; the signal throws pre-load and `<Suspense>` handles it.
- `every([a, b], fn)` combining multiple accessors → replace with a direct reactive expression inside a `createMemo` or inline in the effect compute callback.
- Any remaining cases where `when`/`every` add genuine value (not async-related) → keep as local utility or inline.

### Phase 5 — `createSignal` computed inits (selective, ~106 files)

Only wrap non-literal initial values:
- `createSignal(someExpression)` → `createSignal(() => someExpression)`
- Leave unchanged: `createSignal(0)`, `createSignal(null)`, `createSignal(false)`, `createSignal('')`, `createSignal([])`

The distinction: if the initial value could change between runs of the initializer (i.e. it reads reactive state or a prop), it must be a callback.

### Phase 6 — Smoke test

1. `pnpm build` — confirm tsup succeeds.
2. `tsc --noEmit` — fix any remaining type errors.
3. Manual Storybook spot-check: verify ~5 representative stories (one loader, one control, one material, one staging component, one abstraction).

---

## What Is Not Changing

- solid-three public API (`S3.Props<T>`, `createT()`, `useThree()`, `useFrame()`, `getMeta()`, `hasMeta()`, `autodispose`) — unchanged in `next-solid-2`.
- Component structure, file layout, exports — no reorganisation.
- Unported components in `src/*/unported/` — only touched if they use one of the changed APIs.
- `createRenderEffect` usage — already the correct v2 API; no changes needed.

---

## Out of Scope

- Porting remaining unported components (tracked separately in ROADMAP).
- Addressing existing blocked items (`useContextBridge`, `Environment`, `store.setEvents`).
- Updating Storybook stories beyond what breaks due to API changes.
