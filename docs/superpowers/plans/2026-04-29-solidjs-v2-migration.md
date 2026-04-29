# SolidJS v2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update solid-drei to work with SolidJS v2 (beta.9) and the `next-solid-2` branch of solid-three.

**Architecture:** Category-sweep approach — fix one type of breaking change at a time across all files, from trivial renames to complex architectural changes. Each phase is a focused pass over the codebase.

**Tech Stack:** SolidJS 2.0.0-beta.9, solid-three `next-solid-2` (`https://pkg.pr.new/solid-three@51`), TypeScript, pnpm

---

## SolidJS v2 Breaking Change Reference

Keep this table in mind throughout all tasks:

| v1 | v2 | Notes |
|---|---|---|
| `createComputed(fn)` | `createRenderEffect(fn)` | Direct rename |
| `<For each={xs}>{(x, i) => …}</For>` | `<For each={xs}>{(x, i) => …}</For>` | `x` is now `Accessor<T>`, call as `x()` |
| `createEffect(fn)` | `createEffect(compute, effect)` | `compute` reads signals, returns value; `effect` receives value, runs side effects |
| `createResource(source, fetcher)` | `createMemo(async () => …)` or `createSignal(async () => …)` | Async signal/memo throws pre-resolve; Suspense catches it |
| `createSignal(expr)` | `createSignal(() => expr)` | Only when initial value is computed (reads reactive state) |
| `Resource<T>` type | `Accessor<T>` | async signal/memo returns `Accessor<T>` |

---

## Task 0: Set Up Worktree and Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create worktree on `solid-drei-2` branch**

```bash
git worktree add ../solid-drei-2 -b solid-drei-2
cd ../solid-drei-2
```

- [ ] **Step 2: Update `solid-three` and `solid-js` in `package.json`**

In `package.json` devDependencies, change:
```json
"solid-three": "https://pkg.pr.new/solid-three@5449e5a",
"solid-js": "^1.8.18",
```
to:
```json
"solid-three": "https://pkg.pr.new/solid-three@51",
"solid-js": "2.0.0-beta.9",
"@solidjs/web": "latest",
```

Also update peerDependencies:
```json
"solid-js": "^2.0.0",
"solid-three": ">=0.3.0-next.12",
```

- [ ] **Step 3: Install dependencies**

```bash
pnpm install
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: bump to solid-js v2 and solid-three next-solid-2"
```

---

## Task 1: Phase 1a — Replace `createComputed` with `createRenderEffect`

`createComputed` was removed in v2. `createRenderEffect` is the direct replacement. The main definition lives in `src/utils/conditionals.ts` (used by `whenComputed`), with a few inline uses in other files.

**Files:**
- Modify: `src/utils/conditionals.ts`
- Modify: `src/core/OrbitControls.tsx`
- Modify: `src/core/useAutolisten.ts`

- [ ] **Step 1: Update `src/utils/conditionals.ts`**

Change the import at the top:
```typescript
// Before
import { type Accessor, createComputed, createEffect, createMemo, type Resource } from 'solid-js'

// After
import { type Accessor, createEffect, createMemo, createRenderEffect } from 'solid-js'
```

Change `whenComputed` body:
```typescript
// Before
export function whenComputed<…>(accessor: TAccessor, callback: (value: TValues) => TResult) {
  createComputed(when(accessor, callback))
}

// After
export function whenComputed<…>(accessor: TAccessor, callback: (value: TValues) => TResult) {
  createRenderEffect(when(accessor, callback))
}
```

Remove `wrapNullableResource` entirely (it uses the removed `Resource` type and `value.state` — no longer valid in v2):
```typescript
// Delete this entire function:
export function wrapNullableResource<T extends Resource<any>>(
  value: T,
): Accessor<false | [ReturnType<T>]> {
  return () => value.state === 'ready' && [value()]
}
```

- [ ] **Step 2: Update inline `createComputed` in `src/core/OrbitControls.tsx`**

```typescript
// Before (lines ~69-73)
import { createComputed, createMemo, onCleanup, type JSXElement, type Ref } from 'solid-js'
// …
createComputed(() => controls.connect(config.domElement))
createComputed(() => autolisten('start', config.onStart))
createComputed(() => autolisten('change', config.onChange))
createComputed(() => autolisten('end', config.onEnd))

// After
import { createMemo, createRenderEffect, onCleanup, type JSXElement, type Ref } from 'solid-js'
// …
createRenderEffect(() => controls.connect(config.domElement))
createRenderEffect(() => autolisten('start', config.onStart))
createRenderEffect(() => autolisten('change', config.onChange))
createRenderEffect(() => autolisten('end', config.onEnd))
```

- [ ] **Step 3: Update `src/core/useAutolisten.ts`**

Open the file and replace every `createComputed` call with `createRenderEffect`. Update the import accordingly (remove `createComputed`, add `createRenderEffect`).

- [ ] **Step 4: Verify no remaining `createComputed` references**

```bash
grep -r "createComputed" src/ --include="*.ts" --include="*.tsx"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/utils/conditionals.ts src/core/OrbitControls.tsx src/core/useAutolisten.ts
git commit -m "refactor: replace createComputed with createRenderEffect (v2)"
```

---

## Task 2: Phase 1b — Fix `<For>` Value Accessor

In v2, both `item` (value) and `index` are accessors. Every `<For>` callback must call `item()` instead of using it directly.

**Files:**
- Modify: `src/core/Clone.tsx`
- Modify: `src/core/Cloud.tsx`
- Modify: `src/core/GizmoViewcube.tsx`
- Modify: `src/core/Svg.tsx`
- Modify: `src/core/useFBX.tsx`
- Modify: `src/core/useGLTF.tsx`

- [ ] **Step 1: In each file, find every `<For>` usage**

The pattern to find and update:
```tsx
// Before — value `item` used directly
<For each={someArray}>
  {(item, index) => <SomeComponent prop={item.field} key={item.id} />}
</For>

// After — value `item` called as accessor
<For each={someArray}>
  {(item, index) => <SomeComponent prop={item().field} key={item().id} />}
</For>
```

`index` was already an accessor in v1 (`index()`) — leave those calls unchanged if already present.

- [ ] **Step 2: Verify no raw `<For>` value usage remains**

```bash
grep -n "<For" src/core/Clone.tsx src/core/Cloud.tsx src/core/GizmoViewcube.tsx src/core/Svg.tsx src/core/useFBX.tsx src/core/useGLTF.tsx
```

Review each hit manually to confirm the callback uses `item()`.

- [ ] **Step 3: Commit**

```bash
git add src/core/Clone.tsx src/core/Cloud.tsx src/core/GizmoViewcube.tsx src/core/Svg.tsx src/core/useFBX.tsx src/core/useGLTF.tsx
git commit -m "refactor: update For callbacks to use value accessor (v2)"
```

---

## Task 3: Phase 2 — `createEffect` Split: Controls

In v2, `createEffect` takes two callbacks: `compute` (reactive, returns value) and `effect` (receives value, runs side effects). Split every `createEffect` accordingly.

**Pattern:**
```typescript
// v1
createEffect(() => {
  const value = someSignal()        // reactive read
  someObject.property = value       // side effect
})

// v2
createEffect(
  () => someSignal(),               // compute: reactive read, returns value
  (value) => { someObject.property = value }  // effect: receives value, runs side effect
)
```

If the body is entirely reactive reads with no separable side effect, put everything in `compute` and omit `effect`:
```typescript
createEffect(() => someSignal())    // fine if only tracking
```

**Files:**
- Modify: `src/core/control-utils.ts`
- Modify: `src/core/OrbitControls.tsx`
- Modify: `src/core/MapControls.tsx`
- Modify: `src/core/TrackballControls.tsx`
- Modify: `src/core/FlyControls.tsx`
- Modify: `src/core/PointerLockControls.tsx`
- Modify: `src/core/DragControls.tsx`
- Modify: `src/core/MotionPathControls.tsx`
- Modify: `src/core/ArcballControls.tsx` (if exists)
- Modify: `src/core/CameraControls.tsx` (if exists)
- Modify: `src/core/TransformControls.tsx` (if exists)

- [ ] **Step 1: Update each file — split every `createEffect(fn)` into `createEffect(compute, effect)`**

For each file, find every `createEffect` call. Identify what is a reactive read (goes in `compute`) and what is a side effect (goes in `effect`).

Example from `control-utils.ts` style:
```typescript
// Before
createEffect(() => {
  const controls = controlsSignal()
  if (!controls) return
  controls.enabled = props.enabled ?? true
  onCleanup(() => { controls.enabled = false })
})

// After
createEffect(
  () => [controlsSignal(), props.enabled] as const,
  ([controls, enabled]) => {
    if (!controls) return
    controls.enabled = enabled ?? true
    onCleanup(() => { controls.enabled = false })
  }
)
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/control-utils\|src/core/OrbitControls\|src/core/MapControls\|src/core/TrackballControls\|src/core/FlyControls\|src/core/PointerLockControls\|src/core/DragControls\|src/core/MotionPathControls"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/control-utils.ts src/core/OrbitControls.tsx src/core/MapControls.tsx src/core/TrackballControls.tsx src/core/FlyControls.tsx src/core/PointerLockControls.tsx src/core/DragControls.tsx src/core/MotionPathControls.tsx
git commit -m "refactor: split createEffect into compute/effect in controls (v2)"
```

---

## Task 4: Phase 2 — `createEffect` Split: Cameras and Gizmos

**Files:**
- Modify: `src/core/CubeCamera.tsx`
- Modify: `src/core/OrthographicCamera.tsx`
- Modify: `src/core/PerspectiveCamera.tsx`
- Modify: `src/core/Fisheye.tsx`
- Modify: `src/core/GizmoHelper.tsx` (if exists)
- Modify: `src/core/GizmoViewcube.tsx`
- Modify: `src/core/GizmoViewport.tsx` (if exists)
- Modify: `src/core/Grid.tsx` (if exists)

- [ ] **Step 1: Apply compute/effect split to every `createEffect` in each file**

Same pattern as Task 3. Reactive reads in `compute`, three.js mutations in `effect`.

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/CubeCamera\|src/core/OrthographicCamera\|src/core/PerspectiveCamera\|src/core/Fisheye\|src/core/Gizmo"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/CubeCamera.tsx src/core/OrthographicCamera.tsx src/core/PerspectiveCamera.tsx src/core/Fisheye.tsx src/core/GizmoViewcube.tsx
git commit -m "refactor: split createEffect in cameras and gizmos (v2)"
```

---

## Task 5: Phase 2 — `createEffect` Split: Abstractions

**Files:**
- Modify: `src/core/Billboard.tsx`
- Modify: `src/core/Clone.tsx`
- Modify: `src/core/CurveModifier.tsx`
- Modify: `src/core/Decal.tsx`
- Modify: `src/core/Edges.tsx` (if exists)
- Modify: `src/core/Image.tsx`
- Modify: `src/core/Line.tsx`
- Modify: `src/core/Outlines.tsx`
- Modify: `src/core/ScreenSpace.tsx`
- Modify: `src/core/Svg.tsx`
- Modify: `src/core/Text.tsx`
- Modify: `src/core/Text3D.tsx`
- Modify: `src/core/Trail.tsx`
- Modify: `src/core/Sampler.tsx`
- Modify: `src/core/SpriteAnimator.tsx`

- [ ] **Step 1: Apply compute/effect split to every `createEffect` in each file**

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/Billboard\|src/core/Clone\|src/core/CurveModifier\|src/core/Decal\|src/core/Image\|src/core/Line\|src/core/Outlines\|src/core/ScreenSpace\|src/core/Svg\|src/core/Text\|src/core/Trail\|src/core/Sampler\|src/core/SpriteAnimator"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/Billboard.tsx src/core/Clone.tsx src/core/CurveModifier.tsx src/core/Decal.tsx src/core/Image.tsx src/core/Line.tsx src/core/Outlines.tsx src/core/ScreenSpace.tsx src/core/Svg.tsx src/core/Text.tsx src/core/Text3D.tsx src/core/Trail.tsx src/core/Sampler.tsx src/core/SpriteAnimator.tsx
git commit -m "refactor: split createEffect in abstractions (v2)"
```

---

## Task 6: Phase 2 — `createEffect` Split: Staging and Lighting

**Files:**
- Modify: `src/core/AccumulativeShadows.tsx`
- Modify: `src/core/Backdrop.tsx` (if exists)
- Modify: `src/core/Bounds.tsx`
- Modify: `src/core/CameraShake.tsx`
- Modify: `src/core/Caustics.tsx`
- Modify: `src/core/Center.tsx`
- Modify: `src/core/ContactShadows.tsx`
- Modify: `src/core/Float.tsx`
- Modify: `src/core/Lightformer.tsx`
- Modify: `src/core/RenderCubeTexture.tsx`
- Modify: `src/core/RenderTexture.tsx`
- Modify: `src/core/SpotLight.tsx`
- Modify: `src/core/Stage.tsx`
- Modify: `src/core/Stars.tsx` (if exists)

- [ ] **Step 1: Apply compute/effect split to every `createEffect` in each file**

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/AccumulativeShadows\|src/core/Bounds\|src/core/CameraShake\|src/core/Caustics\|src/core/Center\|src/core/ContactShadows\|src/core/Float\|src/core/Lightformer\|src/core/RenderCubeTexture\|src/core/RenderTexture\|src/core/SpotLight\|src/core/Stage\|src/core/Stars"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/AccumulativeShadows.tsx src/core/Bounds.tsx src/core/CameraShake.tsx src/core/Caustics.tsx src/core/Center.tsx src/core/ContactShadows.tsx src/core/Float.tsx src/core/Lightformer.tsx src/core/RenderCubeTexture.tsx src/core/RenderTexture.tsx src/core/SpotLight.tsx src/core/Stage.tsx
git commit -m "refactor: split createEffect in staging/lighting (v2)"
```

---

## Task 7: Phase 2 — `createEffect` Split: Hooks and Performance

**Files:**
- Modify: `src/core/useAnimations.tsx`
- Modify: `src/core/useBVH.tsx`
- Modify: `src/core/useCamera.tsx` (if exists)
- Modify: `src/core/useDepthBuffer.tsx` (if exists)
- Modify: `src/core/useHelper.tsx`
- Modify: `src/core/useIntersect.tsx`
- Modify: `src/core/useTrailTexture.tsx`
- Modify: `src/core/Points.tsx`
- Modify: `src/core/PerformanceMonitor.tsx`
- Modify: `src/core/AdaptiveDpr.tsx` (if exists)
- Modify: `src/core/Instances.tsx` (if exists)
- Modify: `src/core/MeshPortalMaterial.tsx`
- Modify: `src/core/FaceControls.tsx`
- Modify: `src/core/Facemesh.tsx`

- [ ] **Step 1: Apply compute/effect split to every `createEffect` in each file**

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/useAnimations\|src/core/useBVH\|src/core/useHelper\|src/core/useIntersect\|src/core/useTrailTexture\|src/core/Points\|src/core/PerformanceMonitor\|src/core/MeshPortalMaterial\|src/core/FaceControls\|src/core/Facemesh"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/useAnimations.tsx src/core/useBVH.tsx src/core/useHelper.tsx src/core/useIntersect.tsx src/core/useTrailTexture.tsx src/core/Points.tsx src/core/PerformanceMonitor.tsx src/core/MeshPortalMaterial.tsx src/core/FaceControls.tsx src/core/Facemesh.tsx
git commit -m "refactor: split createEffect in hooks and performance (v2)"
```

---

## Task 8: Phase 2 — `createEffect` Split: Materials and Web Components

**Files:**
- Modify: `src/core/MeshReflectorMaterial.tsx`
- Modify: `src/core/MeshTransmissionMaterial.tsx`
- Modify: `src/core/Wireframe.tsx`
- Modify: `src/materials/SpotLightMaterial.tsx`
- Modify: `src/web/Html.tsx`
- Modify: `src/web/View.tsx`
- Modify: `src/web/ScrollControls.tsx`
- Modify: `src/web/Hud.tsx` (if exists)
- Modify: `src/web/PivotControls.tsx` (if exists)

- [ ] **Step 1: Apply compute/effect split to every `createEffect` in each file**

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/MeshReflector\|src/core/MeshTransmission\|src/core/Wireframe\|src/materials/SpotLight\|src/web/Html\|src/web/View\|src/web/ScrollControls\|src/web/Hud\|src/web/PivotControls"
```

Expected: no output for these files.

- [ ] **Step 3: Commit**

```bash
git add src/core/MeshReflectorMaterial.tsx src/core/MeshTransmissionMaterial.tsx src/core/Wireframe.tsx src/materials/SpotLightMaterial.tsx src/web/Html.tsx src/web/View.tsx src/web/ScrollControls.tsx
git commit -m "refactor: split createEffect in materials and web components (v2)"
```

---

## Task 9: Phase 2 — `createEffect` Split: Remaining Files

Handle any files not covered in Tasks 3–8 that still have `createEffect`.

- [ ] **Step 1: Find remaining files**

```bash
grep -rl "createEffect" src/ --include="*.ts" --include="*.tsx" | grep -v "unported"
```

- [ ] **Step 2: Apply compute/effect split to each remaining file not already handled**

Same pattern as previous tasks.

- [ ] **Step 3: Verify no v1-style createEffect remains in non-unported files**

```bash
grep -rn "createEffect(" src/ --include="*.ts" --include="*.tsx" | grep -v "unported" | grep -v "createEffect(" | head -5
```

- [ ] **Step 4: Commit**

```bash
git add -p
git commit -m "refactor: split createEffect in remaining files (v2)"
```

---

## Task 10: Phase 3 — `createResource` → Async `createMemo`: `useLoader.ts`

`useLoader` is the base loader used by all other loader hooks. It currently returns a `Resource<T>`. In v2, replace with `createMemo(async () => …)` which returns an `Accessor<T>` that throws pre-resolve.

**Files:**
- Modify: `src/core/useLoader.ts`

- [ ] **Step 1: Update `useLoader.ts`**

Replace the `createResource` call:

```typescript
// Before
import { createResource, mergeProps, type Resource } from 'solid-js'
// …
const [resource] = createResource(
  () => [resolve(url), options?.base] as const,
  async ([url, base]) => {
    // … loading logic …
    return result
  },
)
return resource
```

```typescript
// After
import { createMemo, mergeProps } from 'solid-js'
// …
const resource = createMemo(async () => {
  const [resolvedUrl, base] = [resolve(url), options?.base]
  config.onBeforeLoad?.(loader)
  const finalUrl = base ? resolveUrls(base, resolvedUrl) : resolvedUrl

  if (isRecord(finalUrl)) {
    const result = await awaitMapObject(finalUrl, async u => await loadUrl(u))
    config?.onLoad?.(result)
    return result
  }

  const result = await loadUrl(finalUrl)
  config?.onLoad?.(result)
  return result
})
return resource
```

Update the return type from `Resource<T>` to `Accessor<T>` wherever it appears in the file's type signatures.

- [ ] **Step 2: Remove `Resource` type import, add `Accessor` if not already imported**

```typescript
import { createMemo, mergeProps, type Accessor } from 'solid-js'
```

- [ ] **Step 3: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/useLoader"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/core/useLoader.ts
git commit -m "refactor: replace createResource with async createMemo in useLoader (v2)"
```

---

## Task 11: Phase 3 — `createResource` → Async Signal/Memo: Loader Hooks

These hooks all use `createResource` similarly to `useLoader`. Each gets an async `createMemo`.

**Files:**
- Modify: `src/core/useGLTF.tsx`
- Modify: `src/core/useFBX.tsx`
- Modify: `src/core/useFont.tsx`
- Modify: `src/core/useCubeTexture.tsx`
- Modify: `src/core/useMatcapTexture.tsx`
- Modify: `src/core/useDreiNormalTexture.tsx`
- Modify: `src/core/useDetectGPU.tsx`
- Modify: `src/core/useKTX2.tsx` (if uses createResource)

- [ ] **Step 1: For each file, replace `createResource` with async `createMemo`**

General pattern — replace:
```typescript
const [data] = createResource(source, async (src) => {
  return await loadSomething(src)
})
```
with:
```typescript
const data = createMemo(async () => {
  const src = source()    // call source accessor directly
  return await loadSomething(src)
})
```

Remove `Resource<T>` from type signatures, replace with `Accessor<T>` or the inferred return type.

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/useGLTF\|src/core/useFBX\|src/core/useFont\|src/core/useCubeTexture\|src/core/useMatcapTexture\|src/core/useDreiNormalTexture\|src/core/useDetectGPU"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/core/useGLTF.tsx src/core/useFBX.tsx src/core/useFont.tsx src/core/useCubeTexture.tsx src/core/useMatcapTexture.tsx src/core/useDreiNormalTexture.tsx src/core/useDetectGPU.tsx
git commit -m "refactor: replace createResource with async createMemo in loader hooks (v2)"
```

---

## Task 12: Phase 3 — `createResource` → Async Signal/Memo: Component Files

These components use `createResource` internally to load assets.

**Files:**
- Modify: `src/core/PositionalAudio.tsx`
- Modify: `src/core/Svg.tsx`
- Modify: `src/core/Text.tsx`
- Modify: `src/core/SpriteAnimator.tsx`
- Modify: `src/core/FaceControls.tsx`
- Modify: `src/core/FaceLandmarker.tsx`
- Modify: `src/core/useVideoTexture.tsx`
- Modify: `src/web/ScreenVideoTexture.tsx`
- Modify: `src/web/WebcamVideoTexture.tsx`

- [ ] **Step 1: For each file, replace `createResource` with async `createMemo` or `createSignal`**

Use `createMemo(async () => …)` for read-only derived data. Use `createSignal(async () => …)` only if the result needs a setter (mutable loading state). Most cases here are `createMemo`.

Ensure each component using an async memo is wrapped in `<Suspense>` at the call site (or already is). If the component itself renders during loading without a Suspense ancestor, add a `<Suspense fallback={null}>` wrapper inside the component around the part that accesses the async memo result.

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep "src/core/PositionalAudio\|src/core/Svg\|src/core/Text\|src/core/SpriteAnimator\|src/core/FaceControls\|src/core/FaceLandmarker\|src/core/useVideoTexture\|src/web/ScreenVideoTexture\|src/web/WebcamVideoTexture"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/core/PositionalAudio.tsx src/core/Svg.tsx src/core/Text.tsx src/core/SpriteAnimator.tsx src/core/FaceControls.tsx src/core/FaceLandmarker.tsx src/core/useVideoTexture.tsx src/web/ScreenVideoTexture.tsx src/web/WebcamVideoTexture.tsx
git commit -m "refactor: replace createResource with async createMemo in component files (v2)"
```

---

## Task 13: Phase 4 — Eliminate `when`/`every` Guarding Async Accesses

`when`/`every` were used to guard nullable/async values. With async signals throwing pre-resolve, many of these guards are no longer needed. Some guards on non-async optional values (props, refs) may still be useful — keep those.

**Files:** All files importing from `@/utils/conditionals` (see list in spec). Focus on non-unported files:
`src/core/useIntersect.tsx`, `src/core/useDreiNormalTexture.tsx`, `src/core/Trail.tsx`,
`src/core/control-utils.ts`, `src/core/FlyControls.tsx`, `src/core/useHelper.tsx`,
`src/core/useMatcapTexture.tsx`, `src/core/OrthographicCamera.tsx`, `src/core/SpriteAnimator.tsx`,
`src/core/PositionalAudio.tsx`, `src/core/Line.tsx`, `src/core/PointerLockControls.tsx`,
`src/web/Html.tsx`, `src/core/Caustics.tsx`, `src/core/Gltf.tsx`, `src/core/LoaderCache.ts`,
`src/core/MeshReflectorMaterial.tsx`, `src/core/MeshTransmissionMaterial.tsx`, etc.

- [ ] **Step 1: For each file, audit every `when`/`every`/`whenEffect`/`whenComputed`/`check` call**

Decision rule per usage:
- **Wrapping an async memo/signal result** → remove the guard; the async value throws pre-load, and `<Suspense>` handles it. Access the value directly.
- **Guarding a nullable prop or optional ref** → keep the guard (it's still useful for non-async optional values).
- **`whenEffect(accessor, cb)`** → if `accessor` is async, remove and access directly in a `createEffect`. If `accessor` is a nullable prop, convert to `createEffect(() => { const v = accessor(); if (v) cb(v) })`.

- [ ] **Step 2: Remove `when`/`every` imports from files where all usages were removed**

For each file, after removing usages, clean up unused imports from `@/utils/conditionals`.

- [ ] **Step 3: Check if `when`/`every` are still needed in `src/utils/conditionals.ts`**

If no file outside of `conditionals.ts` uses `when`/`every`/`check` anymore, remove their exports. If some files still use them, keep them.

- [ ] **Step 4: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep -v "unported"
```

Fix any errors in non-unported files.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "refactor: remove when/every guards replaced by async signal throws (v2)"
```

---

## Task 14: Phase 5 — `createSignal` Computed Initial Values

In v2, `createSignal` takes a callback for its initial value when that value is computed (reads reactive state). Static literals are unchanged.

**Rule:**
- `createSignal(0)`, `createSignal(null)`, `createSignal(false)`, `createSignal('')`, `createSignal([])`, `createSignal(new SomeClass())` → **leave unchanged**
- `createSignal(props.foo)`, `createSignal(store.value)`, `createSignal(someSignal())`, `createSignal(computed expression)` → **wrap: `createSignal(() => props.foo)`**

- [ ] **Step 1: Find all createSignal calls with non-literal init values**

```bash
grep -rn "createSignal(" src/ --include="*.ts" --include="*.tsx" | grep -v "unported" | grep -v "createSignal(0\|createSignal(1\|createSignal(null\|createSignal(false\|createSignal(true\|createSignal(undefined\|createSignal(''\|createSignal(\"\"\|createSignal(\[\]\|createSignal({\|createSignal(new"
```

Review each result and wrap the initial value in `() =>` if it reads reactive state.

- [ ] **Step 2: Check types**

```bash
pnpm exec tsc --noEmit 2>&1 | grep -v "unported"
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "refactor: wrap computed createSignal initial values in callbacks (v2)"
```

---

## Task 15: Phase 6 — Smoke Test

- [ ] **Step 1: Full type check**

```bash
pnpm exec tsc --noEmit 2>&1 | grep -v "unported" | grep -v "node_modules"
```

Fix every error in non-unported files. Errors in `unported/` are expected and can be ignored.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: successful build with output in `dist/`.

- [ ] **Step 3: Start Storybook and manually verify 5 stories**

```bash
pnpm storybook
```

Open `http://localhost:6006` and verify these stories work:
1. A loader hook story (e.g. `useGLTF` — loads a model)
2. A controls story (e.g. `OrbitControls` — camera moves on drag)
3. A material story (e.g. `MeshTransmissionMaterial` — refractive glass)
4. A staging story (e.g. `AccumulativeShadows` or `ContactShadows`)
5. An abstraction story (e.g. `Text` or `Billboard`)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: solid-drei v2 migration complete — passes build and tsc"
```
