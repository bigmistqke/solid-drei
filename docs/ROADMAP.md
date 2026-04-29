# solid-drei Roadmap

Port of [pmndrs/drei](https://github.com/pmndrs/drei) for [solid-three](https://github.com/solidjs-community/solid-three).

## Status legend

- ✅ Ported & exported
- 🚧 Partially translated (exists in `unported/`, needs completion)
- ❌ Not started
- 🔒 Blocked (missing solid-three API or external dependency)

---

## API mapping notes (solid-three 0.3.x)

When porting unported components, use these equivalents:

| R3F / old solid-three | New solid-three |
|---|---|
| `ThreeProps<T>` | `S3.Props<T>` |
| `extend({ Foo })` | `createT({ Foo })` |
| `applyProps(obj, props)` | `useProps(props, obj, store)` |
| `store.events.compute` | 🔒 No equivalent — blocks ScrollControls, View, CycleRaycast |
| `store.setEvents({...})` | 🔒 No equivalent |
| `context as fiberContext` | 🔒 Internal — not exported |
| `RootState` | `Context` (from `useThree`) |

Things to strip from unported components during porting:
- `RefComponent<TRef, TProps>` — React forwardRef pattern, not needed in SolidJS. Replace with a plain component accepting `ref?` in props.
- `createRef<T>(initial)` — React ref object pattern (`{ current }`). Replace with `let ref: T` locals.
- `mergeRefs(...refs)` — only needed if multiple ref targets; inline the merge in the `ref` callback instead.
- `Composer` — utility in `src/utils/composer.ts` used by Instances; evaluate on a case-by-case basis.

---

## Abstractions

| Component | Status | Notes |
|-----------|--------|-------|
| Billboard | ✅ | |
| CatmullRomLine | ✅ | |
| CubicBezierLine | ✅ | |
| QuadraticBezierLine | ✅ | |
| ComputedAttribute | ✅ | |
| CurveModifier | ✅ | |
| Edges | ✅ | |
| Gltf | ✅ | |
| GradientTexture | ✅ | |
| Image | ✅ | |
| Line | ✅ | |
| PositionalAudio | ✅ | |
| ScreenSpace | ✅ | |
| Svg | ✅ | |
| Text | ✅ | |
| Text3D | ✅ | |
| Trail | ✅ | |
| Clone | ✅ | |
| Decal | ✅ | |
| AsciiRenderer | ✅ | |
| Sampler | ✅ | |
| Bvh | ✅ | |
| Outlines | ❌ | |
| Splat | ❌ | |
| SpriteAnimator | ✅ | |
| Example | ✅ | |

## Cameras

| Component | Status | Notes |
|-----------|--------|-------|
| CubeCamera | ✅ | |
| CubeTexture | ❌ | |
| OrthographicCamera | ✅ | |
| PerspectiveCamera | ✅ | |
| Fisheye | ❌ | |

## Controls

| Component | Status | Notes |
|-----------|--------|-------|
| ArcballControls | ✅ | |
| CameraControls | ✅ | |
| FirstPersonControls | ✅ | |
| FlyControls | ✅ | |
| OrbitControls | ✅ | |
| PointerLockControls | ✅ | |
| TrackballControls | ✅ | |
| TransformControls | ✅ | |
| MapControls | ✅ | |
| FaceControls | ✅ | |
| DeviceOrientationControls | ✅ | |
| DragControls | ❌ | |
| MotionPathControls | ❌ | |

## Gizmos

| Component | Status | Notes |
|-----------|--------|-------|
| GizmoHelper | ✅ | |
| GizmoViewcube | ✅ | |
| GizmoViewport | ✅ | |
| Grid | ✅ | |

## Loaders

| Hook | Status | Notes |
|------|--------|-------|
| useCubeTexture | ✅ | |
| useFBX | ✅ | |
| useFont | ✅ | |
| useGLTF | ✅ | |
| useLoader | ✅ | |
| useProgress | ✅ | |
| useTexture | ✅ | |
| useVideoTexture | ✅ | |
| useKTX2 | ✅ | |
| useSpriteLoader | ❌ | |

## Misc

| Component / Hook | Status | Notes |
|------------------|--------|-------|
| BBAnchor | ✅ | |
| SpriteAnimator | ✅ | |
| Stats | ✅ | |
| StatsGl | ✅ | |
| useAnimations | ✅ | |
| useAutolisten | ✅ | |
| useAspect | ✅ | |
| useBoxProjectedEnv | ✅ | |
| useCamera | ✅ | |
| useCubeCamera | ✅ | |
| useDepthBuffer | ✅ | |
| useDetectGPU | ✅ | |
| useFBO | ✅ | |
| useHelper | ✅ | |
| useIntersect | ✅ | |
| useTrailTexture | ✅ | |
| useBVH | ✅ | |
| PerformanceMonitor | ✅ | |
| useContextBridge | 🔒 | Needs internal `fiberContext` — not exported from solid-three |
| FaceLandmarker | ✅ | |
| Facemesh | ✅ | |
| calculateScaleFactor | ❌ | |

## Shaders / Materials

| Component | Status | Notes |
|-----------|--------|-------|
| MeshDiscardMaterial | ✅ | |
| MeshDistortMaterial | ✅ | |
| MeshReflectorMaterial | ✅ | |
| MeshWobbleMaterial | ✅ | |
| PointMaterial | ✅ | |
| shaderMaterial | ✅ | |
| softShadows | ✅ | |
| Wireframe | ✅ | |
| MeshRefractionMaterial | ✅ | |
| MeshTransmissionMaterial | ✅ | Parent mesh accessed via `getMeta(ref)?.parent?.object` |
| MultiMaterial | ❌ | |
| ShadowAlpha | ❌ | |
| MeshPortalMaterial | ✅ | |

## Shapes

| Component | Status | Notes |
|-----------|--------|-------|
| RoundedBox | ✅ | |
| ScreenQuad | ✅ | |
| shapes (Box, Sphere, etc.) | ✅ | |
| Facemesh | ✅ | |
| ScreenSizer | ❌ | |

## Staging / Lighting

| Component | Status | Notes |
|-----------|--------|-------|
| AccumulativeShadows | ✅ | |
| Backdrop | ✅ | |
| BakeShadows | ✅ | |
| CameraShake | ✅ | |
| Caustics | ✅ | |
| Center | ✅ | |
| Cloud | ✅ | |
| ContactShadows | ✅ | |
| Float | ✅ | |
| Resize | ✅ | |
| Shadow | ✅ | |
| Sky | ✅ | |
| SpotLight | ✅ | |
| Stars | ✅ | |
| useMatcapTexture | ✅ | |
| useDreiNormalTexture | ✅ | |
| Bounds | ✅ | Controls integration via `boundsControlsContext` (optional) |
| Lightformer | ✅ | |
| Stage | ✅ | No Environment (blocked); AccumulativeShadows + ContactShadows still work |
| Environment | 🔒 | Needs solid-three portal + environment map API |
| Sparkles | ✅ | |
| Effects | ✅ | |

## Performance

| Component | Status | Notes |
|-----------|--------|-------|
| BakeShadows | ✅ | |
| Detailed | ✅ | |
| Points | ✅ | |
| Segments | ✅ | |
| Preload | ✅ | |
| meshBounds | ✅ | |
| Instances | ✅ | `Merged` skipped (requires `Composer` utility) |
| AdaptiveDpr | ✅ | |
| AdaptiveEvents | ✅ | |
| PerformanceMonitor | ✅ | |

## Portals / Rendering

| Component | Status | Notes |
|-----------|--------|-------|
| Hud | ✅ | |
| MarchingCubes | 🚧 | |
| RenderTexture | ✅ | |
| Mask | ✅ | |
| MeshPortalMaterial | ✅ | |
| RenderCubeTexture | ❌ | |

## Web (browser-specific)

| Component / Hook | Status | Notes |
|------------------|--------|-------|
| Html | ✅ | |
| KeyboardControls | ✅ | |
| Loader | ✅ | |
| Select | ✅ | |
| useCursor | ✅ | |
| ScrollControls | 🔒 | Needs `store.setEvents`/`compute` (event coordinate override) — not in solid-three |
| View | ✅ | |
| CycleRaycast | ✅ | |
| PresentationControls | 🔒 | Depends on `@react-spring/three` + `@use-gesture/react` (React deps) |
| pivotControls | ✅ | |
| DragControls | ❌ | |
| ScreenVideoTexture | ❌ | |
| WebcamVideoTexture | ❌ | |

---

## Storybook Coverage

**Total: 50/112 stories implemented (~45% coverage)**

| Category | Component / Story | Status | Notes |
|----------|---------------------|--------|-------|
| **Abstractions** | AccumulativeShadows | ✅ | Story implemented |
| | BBAnchor | ✅ | Story implemented |
| | Billboard | ✅ | Story implemented |
| | Center | ✅ | Story implemented |
| | Cloud | ✅ | Story implemented |
| | ContactShadows | ✅ | Story implemented |
| | CurveModifier | ✅ | Story implemented |
| | Edges | ✅ | Story implemented |
| | Float | ✅ | Story implemented |
| | GradientTexture | ✅ | Story implemented |
| | Image | ✅ | Story implemented |
| | Line | ✅ | Story implemented |
| | MeshDistortMaterial | ✅ | Story implemented |
| | MeshWobbleMaterial | ✅ | Story implemented |
| | PositionalAudio | ✅ | Story implemented |
| | Resize | ✅ | Story implemented |
| | ScreenQuad | ✅ | Story implemented |
| | ScreenSpace | ✅ | Story implemented |
| | Svg | ✅ | Story implemented |
| | Text | ✅ | Story implemented |
| | Text3D | ✅ | Story implemented |
| | Trail | ✅ | Story implemented |
| | Clone | ✅ | Ported, story missing |
| | Decal | ✅ | Ported, story missing |
| | AsciiRenderer | ✅ | Ported, story missing |
| | Sampler | ✅ | Ported, story missing |
| | Bvh | ✅ | Ported, story missing |
| | Example | ✅ | Ported, story missing |
| | Outlines | ❌ | Not started |
| | Splat | ❌ | Not started |
| | SpriteAnimator | ✅ | Ported, story missing |
| **Cameras** | CubeCamera | ✅ | Story implemented |
| | OrthographicCamera | ✅ | Story implemented |
| | PerspectiveCamera | ✅ | Story implemented |
| | CubeTexture | ❌ | Not started |
| | Fisheye | ❌ | Not started |
| **Controls** | ArcballControls | ✅ | Ported, story missing |
| | CameraControls | ✅ | Ported, story missing |
| | FirstPersonControls | ✅ | Story implemented |
| | FlyControls | ✅ | Story implemented |
| | OrbitControls | ✅ | Story implemented |
| | PointerLockControls | ✅ | Story implemented |
| | TrackballControls | ✅ | Story implemented |
| | TransformControls | ✅ | Story implemented |
| | MapControls | ✅ | Ported, story missing |
| | FaceControls | ✅ | Ported, story missing |
| | DeviceOrientationControls | ✅ | Ported, story missing |
| | KeyboardControls | ✅ | Ported, story missing |
| | PivotControls | ✅ | Ported, story missing |
| | DragControls | ❌ | Not started |
| | MotionPathControls | ❌ | Not started |
| | ScrollControls | 🔒 | Blocked - needs `store.setEvents`/`compute` |
| | PresentationControls | 🔒 | Blocked - React-specific deps |
| **Gizmos** | GizmoHelper | ✅ | Ported, story missing |
| | GizmoViewport | ✅ | Story implemented |
| | GizmoViewcube | ✅ | Story implemented |
| | Grid | ✅ | Story implemented |
| | TransformControls | ✅ | Story implemented |
| **Loaders** | useCubeTexture | ✅ | Ported, story missing |
| | useFBX | ✅ | Ported, story missing |
| | useFont | ✅ | Ported, story missing |
| | useGLTF | ✅ | Story implemented |
| | useLoader | ✅ | Story implemented |
| | useProgress | ✅ | Ported, story missing |
| | useTexture | ✅ | Story implemented |
| | useVideoTexture | ✅ | Story implemented |
| | useKTX2 | ✅ | Ported, story missing |
| | useSpriteLoader | ❌ | Not started |
| | DetectGPU | ✅ | Ported, story missing |
| | Gltf | ✅ | Ported, story missing |
| | Loader | ✅ | Ported, story missing |
| | MatcapTexture | ✅ | Ported, story missing |
| | NormalTexture | ✅ | Ported, story missing |
| | Sampler | ✅ | Ported, story missing |
| | Fbo | ✅ | Story implemented |
| **Misc** | BBAnchor | ✅ | Story implemented |
| | SpriteAnimator | ✅ | Ported, story missing |
| | Stats | ✅ | Story implemented |
| | StatsGl | ✅ | Ported, story missing |
| | useAnimations | ✅ | Ported, story missing |
| | useAutolisten | ✅ | Ported, story missing |
| | useAspect | ✅ | Ported, story missing |
| | useBoxProjectedEnv | ✅ | Ported, story missing |
| | useCamera | ✅ | Ported, story missing |
| | useCubeCamera | ✅ | Ported, story missing |
| | useDepthBuffer | ✅ | Ported, story missing |
| | useDetectGPU | ✅ | Ported, story missing |
| | useFBO | ✅ | Story implemented |
| | useHelper | ✅ | Ported, story missing |
| | useIntersect | ✅ | Ported, story missing |
| | useTrailTexture | ✅ | Story implemented |
| | useBVH | ✅ | Ported, story missing |
| | PerformanceMonitor | ✅ | Ported, story missing |
| | useContextBridge | 🔒 | Blocked - needs internal `fiberContext` |
| | FaceLandmarker | ✅ | Ported, story missing |
| | Facemesh | ✅ | Ported, story missing |
| | calculateScaleFactor | ❌ | Not started |
| | Example | ✅ | Ported, story missing |
| | Helper | ✅ | Ported, story missing |
| | Bvh | ✅ | Ported, story missing |
| | useCursor | ✅ | Ported, story missing |
| | useSurfaceSampler | ✅ | Ported, story missing |
| **Performance** | BakeShadows | ✅ | Ported, story missing |
| | Detailed | ✅ | Ported, story missing |
| | Points | ✅ | Ported, story missing |
| | Segments | ✅ | Ported, story missing |
| | Preload | ✅ | Ported, story missing |
| | meshBounds | ✅ | Ported, story missing |
| | Instances | ✅ | Ported, story missing |
| | AdaptiveDpr | ✅ | Ported, story missing |
| | AdaptiveEvents | ✅ | Ported, story missing |
| | PerformanceMonitor | ✅ | Ported, story missing |
| | Merged | ❌ | Not started (requires `Composer`) |
| **Portals** | Hud | ✅ | Ported, story missing |
| | MarchingCubes | 🚧 | Partially ported, needs completion |
| | RenderTexture | ✅ | Ported, story missing |
| | Mask | ✅ | Ported, story missing |
| | MeshPortalMaterial | ✅ | Ported, may have edge cases |
| | RenderCubeTexture | ❌ | Not started |
| | View | ✅ | Ported, story missing |
| **Shaders/Materials** | MeshDiscardMaterial | ✅ | Ported, story missing |
| | MeshDistortMaterial | ✅ | Story implemented |
| | MeshReflectorMaterial | ✅ | Ported, story missing |
| | MeshWobbleMaterial | ✅ | Story implemented |
| | PointMaterial | ✅ | Ported, story missing |
| | shaderMaterial | ✅ | Ported, story missing |
| | softShadows | ✅ | Ported, story missing |
| | Wireframe | ✅ | Story implemented |
| | MeshRefractionMaterial | ✅ | Ported, story missing |
| | MeshTransmissionMaterial | ✅ | Ported, story missing |
| | MultiMaterial | ❌ | Not started |
| | ShadowAlpha | ❌ | Not started |
| **Shapes** | RoundedBox | ✅ | Story implemented |
| | ScreenQuad | ✅ | Story implemented |
| | Plane, Box, Sphere, etc. | ✅ | Story implemented |
| | Facemesh | ✅ | Ported, story missing |
| | ScreenSizer | ❌ | Not started |
| | Shapes.Box | ✅ | Ported, story missing |
| | Shapes.Circle | ✅ | Ported, story missing |
| | Shapes.Cone | ✅ | Ported, story missing |
| | Shapes.Cylinder | ✅ | Ported, story missing |
| | Shapes.Dodecahedron | ✅ | Ported, story missing |
| | Shapes.Icosahedron | ✅ | Ported, story missing |
| | Shapes.Octahedron | ✅ | Ported, story missing |
| | Shapes.Plane | ✅ | Ported, story missing |
| | Shapes.Polyhedron | ✅ | Ported, story missing |
| | Shapes.Ring | ✅ | Ported, story missing |
| | Shapes.Sphere | ✅ | Ported, story missing |
| | Shapes.Tetrahedron | ✅ | Ported, story missing |
| | Shapes.Torus | ✅ | Ported, story missing |
| | Shapes.TorusKnot | ✅ | Ported, story missing |
| | Extrude | ✅ | Story implemented |
| | Lathe | ✅ | Story implemented |
| | Tube | ✅ | Story implemented |
| | Shape | ✅ | Story implemented |
| **Staging** | AccumulativeShadows | ✅ | Story implemented |
| | Backdrop | ✅ | Ported, story missing |
| | BakeShadows | ✅ | Ported, story missing |
| | CameraShake | ✅ | Story implemented |
| | Caustics | ✅ | Ported, story missing |
| | Center | ✅ | Story implemented |
| | Cloud | ✅ | Story implemented |
| | ContactShadows | ✅ | Story implemented |
| | Float | ✅ | Story implemented |
| | Resize | ✅ | Story implemented |
| | Shadow | ✅ | Story implemented |
| | Sky | ✅ | Story implemented |
| | SpotLight | ✅ | Ported, story missing |
| | Stars | ✅ | Story implemented |
| | useMatcapTexture | ✅ | Story implemented |
| | useDreiNormalTexture | ✅ | Story implemented |
| | Bounds | ✅ | Ported, story missing |
| | Lightformer | ✅ | Ported, story missing |
| | Stage | ✅ | Ported, story missing |
| | Environment | 🔒 | Blocked - needs solid-three portal API |
| | Sparkles | ✅ | Ported, may have edge cases |
| | Effects | ✅ | Ported, story missing |
| | RandomizedLight | ✅ | Ported, story missing |
| **Web** | Html | ✅ | Story implemented |
| | KeyboardControls | ✅ | Ported, story missing |
| | Loader | ✅ | Ported, story missing |
| | Select | ✅ | Story implemented |
| | useCursor | ✅ | Ported, story missing |
| | ScrollControls | 🔒 | Blocked - needs `store.setEvents` |
| | View | ✅ | Ported, story missing |
| | CycleRaycast | ✅ | Ported, story missing |
| | PresentationControls | 🔒 | Blocked - React-specific deps |
| | pivotControls | ✅ | Ported, story missing |
| | DragControls | ❌ | Not started |
| | ScreenVideoTexture | ❌ | Not started |
| | WebcamVideoTexture | ❌ | Not started |

### WIP / Blocked Components

| Component | Status | Issues |
|-----------|--------|-------|
| MarchingCubes | 🚧 | Partially ported, needs completion |
| Environment | 🔒 | Blocked - needs solid-three portal + environment map API |
| ScrollControls | 🔒 | Blocked - needs `store.setEvents`/`compute` |
| PresentationControls | 🔒 | Blocked - depends on React-specific deps |
| useContextBridge | 🔒 | Blocked - needs internal `fiberContext` |
| DragControls | ❌ | Not started, React-specific |
| Outlines | ❌ | Not started |
| Splat | ❌ | Not started |
| MeshPortalMaterial | 🚠️ | Ported, may have edge cases |
| Sparkles | 🚠️ | Ported, type conflicts resolved |
| FaceControls | 🚠️ | Ported, test coverage needed |
| DeviceOrientationControls | 🚠️ | Ported, browser compatibility |
| MeshRefractionMaterial | 🚠️ | Ported, uses `getMeta(ref)?.parent?.object` |
| MeshTransmissionMaterial | 🚠️ | Ported |
