# solid-drei Roadmap

Port of [pmndrs/drei](https://github.com/pmndrs/drei) for [solid-three](https://github.com/solidjs-community/solid-three).

## Status legend

- ✅ Ported & exported
- 🚧 Partially translated (exists in `unported/`, needs completion)
- ❌ Not started
- 🔒 Blocked (missing solid-three API)

---

## Abstractions

| Component | Status |
|-----------|--------|
| Billboard | ✅ |
| CatmullRomLine | ✅ |
| CubicBezierLine | ✅ |
| QuadraticBezierLine | ✅ |
| ComputedAttribute | ✅ |
| CurveModifier | ✅ |
| Edges | ✅ |
| Gltf | ✅ |
| GradientTexture | ✅ |
| Image | ✅ |
| Line | ✅ |
| PositionalAudio | ✅ |
| ScreenSpace | ✅ |
| Svg | ✅ |
| Text | ✅ |
| Text3D | ✅ |
| Trail | ✅ |
| AsciiRenderer | 🚧 |
| Clone | 🚧 |
| Decal | 🚧 |
| Sampler | 🚧 |
| Bvh | ❌ |
| Outlines | ❌ |
| Splat | ❌ |

## Cameras

| Component | Status |
|-----------|--------|
| CubeCamera | ✅ |
| OrthographicCamera | ✅ |
| PerspectiveCamera | ✅ |
| Fisheye | ❌ |

## Controls

| Component | Status |
|-----------|--------|
| ArcballControls | ✅ |
| CameraControls | ✅ |
| FirstPersonControls | ✅ |
| FlyControls | ✅ |
| OrbitControls | ✅ |
| PointerLockControls | ✅ |
| TrackballControls | ✅ |
| TransformControls | ✅ |
| FaceControls | 🚧 |
| MapControls | 🚧 |
| DeviceOrientationControls | 🔒 |
| DragControls | ❌ |
| MotionPathControls | ❌ |

## Gizmos

| Component | Status |
|-----------|--------|
| GizmoHelper | ✅ |
| GizmoViewcube | ✅ |
| GizmoViewport | ✅ |
| Grid | ✅ |

## Loaders

| Hook | Status |
|------|--------|
| useCubeTexture | ✅ |
| useFBX | ✅ |
| useFont | ✅ |
| useGLTF | ✅ |
| useLoader | ✅ |
| useProgress | ✅ |
| useTexture | ✅ |
| useVideoTexture | ✅ |
| useKTX2 | 🚧 |
| useSpriteLoader | ❌ |

## Misc

| Component / Hook | Status |
|------------------|--------|
| BBAnchor | ✅ |
| SpriteAnimator | ✅ |
| Stats | ✅ |
| useAnimations | ✅ |
| useAutolisten | ✅ |
| useBoxProjectedEnv | ✅ |
| useCubeCamera | ✅ |
| useDepthBuffer | ✅ |
| useDetectGPU | ✅ |
| useFBO | ✅ |
| useHelper | ✅ |
| useTrailTexture | ✅ |
| FaceLandmarker | 🚧 |
| StatsGl | 🚧 |
| useAspect | 🚧 |
| useBVH | 🚧 |
| useCamera | 🚧 |
| useContextBridge | 🚧 |
| useIntersect | 🚧 |
| calculateScaleFactor | ❌ |

## Shaders / Materials

| Component | Status |
|-----------|--------|
| MeshDiscardMaterial | ✅ |
| MeshDistortMaterial | ✅ |
| MeshReflectorMaterial | ✅ |
| MeshWobbleMaterial | ✅ |
| PointMaterial | ✅ |
| shaderMaterial | ✅ |
| softShadows | ✅ |
| Wireframe | ✅ |
| MeshRefractionMaterial | 🚧 |
| MeshTransmissionMaterial | 🚧 |
| MultiMaterial | ❌ |
| ShadowAlpha | ❌ |

## Shapes

| Component | Status |
|-----------|--------|
| RoundedBox | ✅ |
| ScreenQuad | ✅ |
| shapes (Box, Sphere, etc.) | ✅ |
| Facemesh | 🚧 |
| ScreenSizer | ❌ |

## Staging / Lighting

| Component | Status |
|-----------|--------|
| AccumulativeShadows | ✅ |
| Backdrop | ✅ |
| BakeShadows | ✅ |
| CameraShake | ✅ |
| Caustics | ✅ |
| Center | ✅ |
| Cloud | ✅ |
| ContactShadows | ✅ |
| Float | ✅ |
| Resize | ✅ |
| Shadow | ✅ |
| Sky | ✅ |
| SpotLight | ✅ |
| Stars | ✅ |
| useMatcapTexture | ✅ |
| useDreiNormalTexture | ✅ |
| Bounds | 🚧 |
| Lightformer | 🚧 |
| Reflector | 🚧 |
| Stage | 🚧 |
| Environment | 🔒 |
| Sparkles | 🔒 |

## Performance

| Component | Status |
|-----------|--------|
| BakeShadows | ✅ |
| Detailed | ✅ |
| Points | ✅ |
| Segments | ✅ |
| AdaptiveDpr | 🚧 |
| AdaptiveEvents | 🚧 |
| Instances | 🚧 |
| PerformanceMonitor | 🚧 |
| Preload | 🚧 |
| meshBounds | 🚧 |

## Portals / Rendering

| Component | Status |
|-----------|--------|
| Hud | 🔒 |
| MarchingCubes | 🔒 |
| RenderTexture | 🔒 |
| Mask | 🚧 |
| MeshPortalMaterial | 🚧 |
| RenderCubeTexture | ❌ |

## Web (browser-specific)

| Component / Hook | Status |
|------------------|--------|
| Html | ✅ |
| KeyboardControls | ✅ |
| Loader | ✅ |
| Select | ✅ |
| useCursor | ✅ |
| CycleRaycast | 🚧 |
| PresentationControls | 🚧 |
| ScrollControls | 🚧 |
| View | 🚧 |
| pivotControls | 🚧 |
| DragControls | ❌ |
| ScreenVideoTexture | ❌ |
| WebcamVideoTexture | ❌ |
