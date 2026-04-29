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

## Cameras

| Component | Status | Notes |
|-----------|--------|-------|
| CubeCamera | ✅ | |
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
| FaceControls | 🚧 | |
| DeviceOrientationControls | 🔒 | DeviceOrientationEvent not available in all browsers |
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
| useKTX2 | 🚧 | |
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
| FaceLandmarker | 🚧 | |
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

## Shapes

| Component | Status | Notes |
|-----------|--------|-------|
| RoundedBox | ✅ | |
| ScreenQuad | ✅ | |
| shapes (Box, Sphere, etc.) | ✅ | |
| Facemesh | 🚧 | Strip React ref patterns |
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
| Sparkles | 🔒 | `NormalBufferAttributes` vs `NormalOrGLBufferAttributes` type conflict in solid-three |

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
| AdaptiveDpr | 🔒 | solid-three missing performance/dpr API |
| AdaptiveEvents | 🔒 | solid-three missing `store.events` API |

## Portals / Rendering

| Component | Status | Notes |
|-----------|--------|-------|
| Hud | 🔒 | |
| MarchingCubes | 🔒 | |
| RenderTexture | 🔒 | |
| Mask | ✅ | |
| MeshPortalMaterial | 🚧 | Uses `__r3f.parent`, `setEvents`, `RenderTexture` — blocked |
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
| View | 🔒 | Needs `store.setEvents({ connected })` — not in solid-three |
| CycleRaycast | 🔒 | Needs `store.setEvents({ filter })` — not in solid-three |
| PresentationControls | 🔒 | Depends on `@react-spring/three` + `@use-gesture/react` (React deps) |
| pivotControls | 🚧 | |
| DragControls | ❌ | |
| ScreenVideoTexture | ❌ | |
| WebcamVideoTexture | ❌ | |
