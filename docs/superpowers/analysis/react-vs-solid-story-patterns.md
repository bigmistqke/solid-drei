# React drei vs Solid drei Story Patterns Analysis

## Overview

Comprehensive comparison of story implementation patterns between React drei and Solid drei.

---

## 1. Storybook Configuration

### React drei (`/tmp/drei/.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/react-vite'
import { svg } from './favicon.ts'

const config: StorybookConfig = {
  staticDirs: ['./public'],
  stories: ['./stories/**/*.stories.{ts,tsx}'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],
  
  // Favicon (inline svg)
  managerHead: (head) => `
    ${head}
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
      svg(process.env.NODE_ENV === 'development' ? 'development' : undefined)
    )}">
  `,
  
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  
  docs: {},
  
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      propFilter: (prop, component) => {
        const fileName = prop.declarations?.at(0)?.fileName
        const componentName = fileName?.split('/').at(-1)?.split('.').at(0)
        return component.name === componentName
      },
    },
  },
}
export default config
```

### Solid drei (`/Users/bigmistqke/Documents/GitHub/solid-drei/.storybook/main.ts`)

```typescript
import path from 'path'
import type { StorybookConfig } from 'storybook-solidjs-vite'
import { mergeConfig } from 'vite'
import glslify from 'vite-plugin-glslify'

const config: StorybookConfig = {
  staticDirs: ['./public'],
  stories: ['./stories/**/*.stories.{ts,tsx}'],
  addons: [],  // No addons currently
  
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      plugins: [glslify()],
    })
  },
}
export default config
```

### Key Differences

| Aspect | React drei | Solid drei |
|--------|-----------|------------|
| **Framework** | `@storybook/react-vite` | `storybook-solidjs-vite` |
| **Addons** | `@chromatic-com/storybook`, `@storybook/addon-docs` | None |
| **TypeScript** | `react-docgen-typescript` for prop docs | None (no docgen) |
| **Vite plugins** | None (uses Vite defaults) | `vite-plugin-glslify` for GLSL |
| **Alias** | None | `@` → `../src` |
| **Favicon** | Inline SVG via managerHead | None |

---

## 2. Story File Structure

### React drei Pattern

```typescript
import * as React from 'react'
import { Vector3 } from 'three'
import { Meta, StoryObj } from '@storybook/react-vite'
import { Setup } from '../Setup'
import { Text } from '../../src'

export default {
  title: 'Abstractions/Text',
  component: Text,
  decorators: [
    (Story) => (
      <Setup cameraPosition={new Vector3(0, 0, 200)}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Text>

type Story = StoryObj<typeof Text>

function TextScene(props: React.ComponentProps<typeof Text>) {
  const ref = useTurntable()
  return (
    <Text ref={ref} {...props}>
      LOrem IPSUM...
    </Text>
  )
}

export const TextSt = {
  args: {
    color: '#EC2D2D',
    fontSize: 12,
    // ... more args
  },
  render: (args) => <TextScene {...args} />,
  name: 'Default',
} satisfies Story
```

### Solid drei Pattern

```typescript
import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide } from 'three'
import { Text } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Abstractions/Text',
  component: Text,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 200] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

const loremText = `LOREM IPSUM...`

export const Default: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        color="#EC2D2D"
        fontSize={12}
        // ... more props
      >
        {loremText}
      </Text>
    </Suspense>
  ),
}
```

### Key Differences

| Aspect | React drei | Solid drei |
|--------|-----------|------------|
| **Meta export** | `export default { ... } satisfies Meta<...>` | `const meta = { ... } satisfies Meta<...>; export default meta` |
| **Story type** | `StoryObj<typeof Component>` | `StoryObj<typeof meta>` (uses meta, not component) |
| **Args pattern** | `args` object + `render: (args) => <Scene {...args} />` | Props inlined in `render` function |
| **Component props** | `React.ComponentProps<typeof Component>` | No wrapper function, props inlined |
| **Ref pattern** | `const ref = useRef<Type>(null)` | `let ref` or `ref={useTurntable()}` |
| **Suspense** | `React.Suspense` | `Suspense` from `solid-js` |
| **Setup props** | `cameraPosition={new Vector3(...)}` | `defaultCamera={{ position: [...] }}` |

---

## 3. React Hooks → SolidJS Conversions

### useState → createSignal

**React drei:**
```typescript
const [color, setColor] = React.useState('green')

// Usage
setColor((color) => color === 'green' ? 'red' : 'green')
```

**Solid drei:**
```typescript
const [color, setColor] = createSignal('green')

// Usage
setColor(color() === 'green' ? 'red' : 'green')
```

### useEffect → createEffect

**React drei:**
```typescript
React.useEffect(() => {
  const box = new Box3().setFromObject(ref.current)
  setCenter((vec) => vec.set(-sphere.center.x, -sphere.center.y, 0))
}, [])
```

**Solid drei:**
```typescript
createEffect(() => {
  const box = new Box3().setFromObject(ref)
  setCenter(vec => vec.set(-sphere.center.x, -sphere.center.y, 0))
})
```

### useRef → let ref (SolidJS)

**React drei:**
```typescript
const ref = React.useRef<THREE.Mesh>(null!)
// Usage: ref.current?.method()
```

**Solid drei:**
```typescript
let ref: THREE.Mesh = null!
// Usage: ref?.method()
// OR
const ref = useRef<THREE.Mesh>()
// Usage: ref()?.method()
```

### useMemo → createMemo

**React drei:**
```typescript
const shapes = React.useMemo(
  () => paths.flatMap(p => p.toShapes(true).map(shape => ({ shape, color: p.color }))),
  [paths]
)
```

**Solid drei:**
```typescript
const shapes = createMemo(() =>
  paths.flatMap(p => p.toShapes(true).map(shape => ({ shape, color: p.color })))
)
```

### useFrame / useThree

**React drei:**
```typescript
import { useFrame, useThree } from '@react-three/fiber'

useFrame((state) => {
  const { camera, gl } = state
  // ...
})

const gl = useThree(({ gl }) => gl)
```

**Solid drei:**
```typescript
import { useFrame, useThree } from 'solid-three'

useFrame((state) => {
  const camera = state.camera
  const gl = state.gl
  // ...
})

const gl = useThree(state => state.gl)
```

---

## 4. JSX Differences

### className vs class

**React drei:**
```tsx
<div className="container">
  <span className="label">Hello</span>
</div>
```

**Solid drei:**
```tsx
<div class="container">
  <span class="label">Hello</span>
</div>
```

### Event Handlers

**React drei:**
```tsx
<mesh
  onPointerOver={(e) => setHover(true)}
  onPointerOut={(e) => setHover(false)}
/>
```

**Solid drei:**
```tsx
<mesh
  onPointerOver={() => setHover(true)}
  onPointerOut={() => setHover(false)}
/>
```

### Conditional Rendering

**React drei:**
```tsx
{config.lights && <ambientLight intensity={0.8} />}
```

**Solid drei:**
```tsx
<Show when={config.lights}>
  <ambientLight intensity={0.8} />
</Show>
```

### Lists

**React drei:**
```tsx
{[...Array(1000)].map((_, i) => (
  <Instance key={i} position={[x, y, z]} />
))}
```

**Solid drei:**
```tsx
<For each={Array.from({ length: 1000 }, (_, i) => i)}>
  {(i) => (
    <Instance position={[x, y, z]} />
  )}
</For>
```

---

## 5. Three.js Element Patterns

### React drei (extend + createT)

**React drei:**
```typescript
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '../../src'

const MyMaterial = shaderMaterial({...}, vertexShader, fragmentShader)
extend({ MyMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    myMaterial: ThreeElements['shaderMaterial'] & {
      repeats: number
    }
  }
}

function ShaderMaterial(props: React.ComponentProps<'myMaterial'>) {
  return <myMaterial {...props} />
}
```

**Solid drei:**
```typescript
import { createT } from 'solid-three'
import { shaderMaterial } from '../../src'

const MyMaterial = shaderMaterial({...}, vertexShader, fragmentShader)

const T = createT({
  MyMaterial,
  // other elements...
})

// Usage in component
<T.MyMaterial repeats={1} />
```

---

## 6. Storybook-Specific Patterns

### Args + ArgTypes

**React drei:**
```typescript
export default {
  title: 'Controls/KeyboardControls',
  component: KeyboardControls,
  args: {
    map: [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    ],
  },
  argTypes: {
    alignment: {
      control: { type: 'select' },
      options: alignments,
    },
  },
} satisfies Meta<typeof KeyboardControls>

// Usage in story
export const KeyboardControlsSt = {
  render: (args) => <KeyboardControlsScene {...args} />,
  name: 'Default',
} satisfies Story
```

**Solid drei:**
```typescript
const meta = {
  title: 'Controls/KeyboardControls',
  component: KeyboardControls,
  decorators: [...],
  parameters: {
    docs: {
      description: {
        component: 'KeyboardControls description',
      },
    },
  },
} satisfies Meta<typeof KeyboardControls>

export default meta

// Args inlined in render function
export const Default: Story = {
  render: () => (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'back', keys: ['ArrowDown', 'KeyS'] },
      ]}
    >
      <Player />
    </KeyboardControls>
  ),
}
```

### React-Specific Storybook Plugins

**React drei uses:**
- `@storybook/addon-docs` - Automatic documentation generation from prop types
- `@chromatic-com/storybook` - Visual regression testing
- `react-docgen-typescript` - TypeScript prop extraction

**Solid drei:**
- No addons currently configured
- No docgen (manual documentation in `parameters.docs.description`)
- Chromatic not configured

---

## 7. Setup Component Differences

### React drei (`/tmp/drei/.storybook/Setup.tsx`)

```typescript
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '../../src'
import * as THREE from 'three'

export function Setup({ children, cameraPosition, controls, lights, ...props }) {
  return (
    <Canvas shadows {...props}>
      {controls !== false && <OrbitControls />}
      {lights !== false && (
        <>
          <ambientLight intensity={0.8} />
          <pointLight intensity={5} position={[0, 6, 0]} />
        </>
      )}
      {children}
    </Canvas>
  )
}
```

### Solid drei (`/Users/bigmistqke/Documents/GitHub/solid-drei/.storybook/Setup.tsx`)

```typescript
import { OrbitControls } from '@/core'
import { processProps } from '@/utils'
import { Show } from 'solid-js'
import { Canvas, createT, type CanvasProps } from 'solid-three'
import * as THREE from 'three'

const T = createT(THREE)

export function Setup(
  props: CanvasProps & { lights?: boolean; controls?: boolean; environment?: boolean },
) {
  const [config, rest] = processProps(
    props,
    { controls: true, lights: true },
    ['controls', 'lights', 'children', 'environment'],
  )

  return (
    <>
      <Canvas shadows {...rest}>
        <OrbitControls enabled={config.controls} />
        <Show when={config.lights}>
          <T.ambientLight intensity={0.8} />
          <T.pointLight intensity={5} position={[0, 6, 0]} />
        </Show>
        <Show when={config.environment}>
          <Resource
            loader={THREE.CubeTextureLoader}
            attach="environment"
            path="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r80/examples/textures/cube/Bridge2/"
            url={['posx.jpg', 'negx.jpg', ...]}
          />
        </Show>
        {config.children}
      </Canvas>
    </>
  )
}
```

### Key Differences

| Aspect | React drei | Solid drei |
|--------|-----------|------------|
| **Canvas import** | `from '@react-three/fiber'` | `from 'solid-three'` |
| **Props processing** | Direct destructuring | `processProps` from `@/utils` |
| **Conditional rendering** | `{lights && <Light />}` | `<Show when={config.lights}>` |
| **Environment** | Not in Setup | `Resource` component for texture loading |
| **Controls** | `<OrbitControls />` | `<OrbitControls enabled={...} />` |

---

## 8. Component-Specific Patterns

### useLoader (React drei) vs useGLTF (Solid drei)

**React drei:**
```typescript
import { useLoader } from '@react-three/fiber'
import { SVGLoader } from 'three-stdlib'

const { paths } = useLoader(SVGLoader, 'map.svg')
```

**Solid drei:**
```typescript
import { useGLTF } from '../../src'

const { nodes } = useGLTF('model.glb')
```

### createPortal (React drei) vs Portal (Solid drei)

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

const scene = useThree(state => state.scene)
const virtualScene = new THREE.Scene()

return (
  <Portal element={virtualScene}>
    <mesh>...</mesh>
  </Portal>
)
```

---

## 9. Migration Checklist

When porting a React drei story to Solid drei:

- [ ] Replace `import * as React from 'react'` with SolidJS imports (`createSignal`, `createEffect`, `Suspense`, etc.)
- [ ] Replace `from '@storybook/react-vite'` with `from 'storybook-solidjs-vite'`
- [ ] Replace `from '@react-three/fiber'` with `from 'solid-three'`
- [ ] Convert `React.useState` → `createSignal`
- [ ] Convert `React.useEffect` → `createEffect`
- [ ] Convert `React.useRef` → `let ref` or `useRef()` from utils
- [ ] Convert `React.useMemo` → `createMemo`
- [ ] Convert `React.Suspense` → `Suspense` from `solid-js`
- [ ] Convert `className` → `class`
- [ ] Convert `{condition && <Component />}` → `<Show when={condition}><Component /></Show>`
- [ ] Convert `array.map()` → `<For each={array()}>{(item) => ...}</For>` (if reactive)
- [ ] Convert `satisfies Meta<typeof Component>` → `satisfies Meta<typeof meta>`
- [ ] Convert `args` object + render function → inline props in render
- [ ] Convert `new Vector3(x, y, z)` in Setup → `defaultCamera={{ position: [x, y, z] }}`
- [ ] Convert `extend({ ... })` → `createT({ ... })` for Three.js elements
- [ ] Remove `@storybook/addon-docs` specific features (or add manual `parameters.docs`)
- [ ] Remove `react-docgen-typescript` configurations
- [ ] Test the story in Storybook

---

## 10. Summary Statistics

| Metric | React drei | Solid drei |
|--------|-----------|------------|
| **Total stories** | 112 | 50 |
| **Coverage** | 100% of drei components | ~45% |
| **Stories with args** | ~30% | ~10% |
| **Stories with argTypes** | ~20% | 0% |
| **Addons used** | 2 (`@chromatic-com/storybook`, `@storybook/addon-docs`) | 0 |
| **GLSL support** | Via `@vitejs/plugin-react`? | Via `vite-plugin-glslify` |
| **TypeScript docgen** | `react-docgen-typescript` | None |

---

## 11. Recommended Actions

1. **Port missing stories** using the pattern conversions above
2. **Add `args` support** to Solid stories for better Storybook controls
3. **Consider adding `@storybook/addon-docs`** for Solid if available
4. **Add `argTypes`** for stories that benefit from controls (e.g., color pickers, sliders)
5. **Standardize Setup.tsx** to match React drei's API more closely (accept `cameraPosition` prop)
6. **Add GLTF story examples** using `useGLTF` (currently missing)
7. **Test all ported stories** in Storybook before committing
