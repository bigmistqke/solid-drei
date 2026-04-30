# Port Missing Storybook Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port all 62 missing Storybook stories from React drei to solid-drei, achieving ~90%+ story coverage.

**Architecture:** Each story file will follow the established solid-drei pattern:
- Use `storybook-solidjs-vite` for Meta/StoryObj types
- Use `createT` from `solid-three` for Three.js elements
- Use `Setup` component from `../Setup` with appropriate camera/defaults
- Convert React patterns (hooks, state) to SolidJS equivalents (createSignal, createEffect, useFrame)
- Convert JSX to SolidJS JSX (no `className`, use `class`, no `htmlFor`, use `for`)

**Tech Stack:** SolidJS, solid-three, storybook-solidjs-vite, Three.js, three-stdlib

---

## Story Groups for Parallel Execution

### Group 1: Abstractions Stories (7 stories)
**Files to create:**
- `src/abstractions/Outlines.tsx` (if not ported) + `.storybook/stories/Outlines.stories.tsx`
- `.storybook/stories/Splat.stories.tsx` (if not ported)
- `.storybook/stories/SpriteAnimator.stories.tsx`
- `.storybook/stories/Example.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/Outlines.stories.tsx`, `SpriteAnimator.stories.tsx`, `Example.stories.tsx`

---

### Group 2: Camera Stories (2 stories)
**Files to create:**
- `.storybook/stories/CubeTexture.stories.tsx`
- `.storybook/stories/Fisheye.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/CubeTexture.stories.tsx`

---

### Group 3: Control Stories (8 stories)
**Files to create:**
- `.storybook/stories/ArcballControls.stories.tsx`
- `.storybook/stories/CameraControls.stories.tsx`
- `.storybook/stories/DeviceOrientationControls.stories.tsx`
- `.storybook/stories/FaceControls.stories.tsx`
- `.storybook/stories/KeyboardControls.stories.tsx`
- `.storybook/stories/MapControls.stories.tsx`
- `.storybook/stories/PivotControls.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 4: Gizmo Stories (1 story)
**Files to create:**
- `.storybook/stories/GizmoHelper.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/GizmoHelper.stories.tsx`

---

### Group 5: Loader Stories (10 stories)
**Files to create:**
- `.storybook/stories/DetectGPU.stories.tsx`
- `.storybook/stories/Fbx.stories.tsx`
- `.storybook/stories/Gltf.stories.tsx`
- `.storybook/stories/Ktx2.stories.tsx`
- `.storybook/stories/Loader.stories.tsx`
- `.storybook/stories/MatcapTexture.stories.tsx`
- `.storybook/stories/NormalTexture.stories.tsx`
- `.storybook/stories/Progress.stories.tsx`
- `.storybook/stories/Sampler.stories.tsx`
- `.storybook/stories/useFont.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 6: Misc Stories (12 stories)
**Files to create:**
- `.storybook/stories/Bvh.stories.tsx`
- `.storybook/stories/Helper.stories.tsx`
- `.storybook/stories/useAnimations.stories.tsx`
- `.storybook/stories/useAspect.stories.tsx`
- `.storybook/stories/useCamera.stories.tsx`
- `.storybook/stories/useContextBridge.stories.tsx` (may stay blocked)
- `.storybook/stories/useCursor.stories.tsx`
- `.storybook/stories/useDepthBuffer.stories.tsx`
- `.storybook/stories/useIntersect.stories.tsx`
- `.storybook/stories/useSurfaceSampler.stories.tsx`
- `.storybook/stories/FaceLandmarker.stories.tsx`
- `.storybook/stories/Facemesh.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 7: Performance Stories (10 stories)
**Files to create:**
- `.storybook/stories/AdaptiveDpr.stories.tsx` (combine with AdaptiveEvents)
- `.storybook/stories/Detailed.stories.tsx`
- `.storybook/stories/Instances.stories.tsx`
- `.storybook/stories/meshBounds.stories.tsx`
- `.storybook/stories/Points.stories.tsx`
- `.storybook/stories/Preload.stories.tsx`
- `.storybook/stories/Segments.stories.tsx`
- `.storybook/stories/BakeShadows.stories.tsx`
- `.storybook/stories/PerformanceMonitor.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 8: Portal Stories (5 stories)
**Files to create:**
- `.storybook/stories/Hud.stories.tsx`
- `.storybook/stories/View.stories.tsx`
- `.storybook/stories/RenderTexture.stories.tsx`
- `.storybook/stories/Mask.stories.tsx`
- `.storybook/stories/MeshPortalMaterial.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 9: Shader/Material Stories (5 stories)
**Files to create:**
- `.storybook/stories/MeshRefractionMaterial.stories.tsx`
- `.storybook/stories/MeshTransmissionMaterial.stories.tsx`
- `.storybook/stories/ShadowAlpha.stories.tsx` (if not started)
- `.storybook/stories/shaderMaterial.stories.tsx`
- `.storybook/stories/MultiMaterial.stories.tsx` (if not started)

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 10: Shape Stories (15 stories)
**Files to create:**
- `.storybook/stories/Shapes.Box.stories.tsx`
- `.storybook/stories/Shapes.Circle.stories.tsx`
- `.storybook/stories/Shapes.Cone.stories.tsx`
- `.storybook/stories/Shapes.Cylinder.stories.tsx`
- `.storybook/stories/Shapes.Dodecahedron.stories.tsx`
- `.storybook/stories/Shapes.Icosahedron.stories.tsx`
- `.storybook/stories/Shapes.Octahedron.stories.tsx`
- `.storybook/stories/Shapes.Plane.stories.tsx`
- `.storybook/stories/Shapes.Polyhedron.stories.tsx`
- `.storybook/stories/Shapes.Ring.stories.tsx`
- `.storybook/stories/Shapes.Sphere.stories.tsx`
- `.storybook/stories/Shapes.Tetrahedron.stories.tsx`
- `.storybook/stories/Shapes.Torus.stories.tsx`
- `.storybook/stories/Shapes.TorusKnot.stories.tsx`
- `.storybook/stories/ScreenSizer.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/Shapes.*.stories.tsx`

---

### Group 11: Staging Stories (15 stories)
**Files to create:**
- `.storybook/stories/Backdrop.stories.tsx`
- `.storybook/stories/Bounds.stories.tsx`
- `.storybook/stories/Caustics.stories.tsx`
- `.storybook/stories/Environment.stories.tsx` (will stay blocked)
- `.storybook/stories/Lightformer.stories.tsx`
- `.storybook/stories/RandomizedLight.stories.tsx`
- `.storybook/stories/Spotlight.stories.tsx`
- `.storybook/stories/Stage.stories.tsx`
- `.storybook/stories/Effects.stories.tsx`

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

### Group 12: Web Stories (6 stories)
**Files to create:**
- `.storybook/stories/CycleRaycast.stories.tsx`
- `.storybook/stories/PresentationControls.stories.tsx` (may stay blocked)
- `.storybook/stories/ScrollControls.stories.tsx` (may stay blocked)
- `.storybook/stories/Select.stories.tsx`
- `.storybook/stories/ScreenVideoTexture.stories.tsx` (if not started)
- `.storybook/stories/WebcamVideoTexture.stories.tsx` (if not started)

**Reference:** `/tmp/drei/.storybook/stories/` (respective files)

---

## Complete Migration Reference

Based on extensive analysis of React drei vs Solid drei patterns:

### 1. Import Conversions

| React drei | Solid drei |
|-----------|------------|
| `import * as React from 'react'` | Remove (use SolidJS imports) |
| `import { Meta, StoryObj } from '@storybook/react-vite'` | `import type { Meta, StoryObj } from 'storybook-solidjs-vite'` |
| `import { useFrame, useThree } from '@react-three/fiber'` | `import { useFrame, useThree } from 'solid-three'` |
| `import { Canvas } from '@react-three/fiber'` | `import { Canvas } from 'solid-three'` |
| `import { extend } from '@react-three/fiber'` | `import { createT } from 'solid-three'` |
| `import { useState } from 'react'` | `import { createSignal } from 'solid-js'` |
| `import { useEffect } from 'react'` | `import { createEffect } from 'solid-js'` |
| `import { useRef } from 'react'` | `import { useRef } from '@/utils'` or `let ref` |
| `import { useMemo } from 'react'` | `import { createMemo } from 'solid-js'` |
| `import { Suspense } from 'react'` | `import { Suspense } from 'solid-js'` |

### 2. Meta/Story Pattern

**React drei:**
```typescript
export default {
  title: 'Category/Component',
  component: Component,
  decorators: [...],
  args: { prop: value },
  argTypes: { prop: { control: 'select', options: [...] } },
} satisfies Meta<typeof Component>

type Story = StoryObj<typeof Component>

export const StoryName: Story = {
  render: (args) => <Scene {...args} />,
  name: 'Default',
}
```

**Solid drei:**
```typescript
const meta = {
  title: 'Category/Component',
  component: Component,
  decorators: [
    (Story) => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Component description',
      },
    },
  },
} satisfies Meta<typeof Component>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Component prop={value} />,
}
```

### 3. Hook Conversions

**useState → createSignal:**
```typescript
// React
const [color, setColor] = React.useState('green')
setColor('red')

// SolidJS
const [color, setColor] = createSignal('green')
setColor('red')
```

**useEffect → createEffect:**
```typescript
// React
React.useEffect(() => {
  // effect
  return () => { /* cleanup */ }
}, [deps])

// SolidJS
createEffect(() => {
  // effect
  onCleanup(() => { /* cleanup */ })
})
```

**useRef → let ref:**
```typescript
// React
const ref = React.useRef<Mesh>(null!)
ref.current.position.set(0, 0, 0)

// SolidJS
let ref: Mesh = null!
ref?.position.set(0, 0, 0)

// OR using utils/useRef
const ref = useRef<Mesh>()
ref()?.position.set(0, 0, 0)
```

**useMemo → createMemo:**
```typescript
// React
const shapes = React.useMemo(() => computeShapes(), [deps])

// SolidJS
const shapes = createMemo(() => computeShapes())
```

### 4. JSX Conversions

**className → class:**
```tsx
// React
<div className="container" />

// SolidJS
<div class="container" />
```

**Conditional rendering:**
```tsx
// React
{condition && <Component />}
{condition ? <A /> : <B />}

// SolidJS
<Show when={condition}><Component /></Show>
<Show when={condition} fallback={<B />}><A /></Show>
```

**Lists:**
```tsx
// React
{[...Array(100)].map((_, i) => (
  <Instance key={i} position={[x, y, z]} />
))}

// SolidJS
<For each={Array.from({ length: 100 }, (_, i) => i)}>
  {(i) => (
    <Instance position={[x, y, z]} />
  )}
</For>
```

**Event handlers:**
```tsx
// React
<mesh onPointerOver={(e) => setHover(true)} />

// SolidJS
<mesh onPointerOver={() => setHover(true)} />
```

### 5. Setup Component Props

**React drei:**
```tsx
<Setup cameraPosition={new Vector3(0, 0, 5)} lights={true} controls={false}>
  <Story />
</Setup>
```

**Solid drei:**
```tsx
<Setup defaultCamera={{ position: [0, 0, 5] }} controls={true} lights={true}>
  <Story />
</Setup>
```

### 6. Three.js Elements

**React drei (extend + custom elements):**
```typescript
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '../../src'

const MyMaterial = shaderMaterial({...}, vertex, fragment)
extend({ MyMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    myMaterial: ThreeElements['shaderMaterial'] & { repeats: number }
  }
}

function ShaderMaterial(props: React.ComponentProps<'myMaterial'>) {
  return <myMaterial {...props} />
}
```

**Solid drei (createT):**
```typescript
import { createT } from 'solid-three'
import { shaderMaterial } from '../../src'

const MyMaterial = shaderMaterial({...}, vertex, fragment)

const T = createT({
  MyMaterial,
  // other elements...
})

// Usage
<T.MyMaterial repeats={1} />
```

### 7. createPortal (React drei) vs Portal (Solid drei)

**React drei:**
```typescript
import { createPortal, useThree } from '@react-three/fiber'

const scene = useThree(({ scene }) => scene)
const virtualScene = new THREE.Scene()

return createPortal(
  <mesh>...</mesh>,
  virtualScene
)
```

**Solid drei:**
```typescript
import { Portal, useThree } from 'solid-three'

const scene = useThree((state) => state.scene)
const virtualScene = new THREE.Scene()

return (
  <Portal element={virtualScene}>
    <mesh>...</mesh>
  </Portal>
)
```

---

## Common Pattern Template

```tsx
import { createEffect, createSignal, Show, Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Component } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Category/ComponentName',
  component: Component,
  decorators: [
    (Story) => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Component>

export default meta
type Story = StoryObj<typeof meta>

// Convert React hooks to SolidJS
// React: useState -> SolidJS: createSignal
// React: useEffect -> SolidJS: createEffect
// React: useRef -> SolidJS: let ref (mutable variable)
// React: <div className="x"> -> SolidJS: <div class="x">
```

---

## Task Execution Notes

Each agent should:
1. Read the drei version of the story
2. Read a similar solid-drei story for pattern reference
3. Convert React patterns to SolidJS equivalents
4. Test the story renders in Storybook
5. Commit with descriptive message

### Key Conversions:
- `React.useState` → `createSignal`
- `React.useEffect` → `createEffect`
- `React.useRef` → `let ref = null!` or `useRef()` from utils
- `React.Suspense` → `Suspense` from solid-js
- `className` → `class`
- Event handlers: `onClick={handler}` stays same
- Three.js elements: Use `T.Element` from `../t`

---

## Verification

After all groups complete:
1. Run `npm run storybook` to verify all stories render
2. Check for console errors
3. Update ROADMAP.md story count
4. Commit all changes with summary message
