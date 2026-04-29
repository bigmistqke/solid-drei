# solid-drei Roadmap

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Ported and story tested |
| 🧪 | Ported, no story yet |
| 🚧 | Story exists but broken / needs work |
| ❌ | Not started |
| 🔇 | Intentionally omitted |

---

## Components

### Abstractions
| Component | Status | Notes |
|-----------|--------|-------|
| AsciiRenderer | ✅ | |
| Billboard | ✅ | |
| CatmullRomLine | ✅ | |
| Clone | ✅ | |
| ComputedAttribute | ✅ | |
| CubicBezierLine | ✅ | |
| Decal | ✅ | |
| Edges | ✅ | |
| Facemesh | ✅ | |
| Gltf | ✅ | |
| GradientTexture | ✅ | |
| Image | ✅ | |
| Line | ✅ | |
| MarchingCubes | ✅ | Frame ordering fixed (reset -1, addBall 0, update +1) |
| Outlines | ✅ | |
| PositionalAudio | ✅ | |
| QuadraticBezierLine | ✅ | |
| Sampler | ✅ | |
| ScreenSpace | ✅ | |
| Splat | ✅ | Full port: streaming loader, Web Worker depth sort, GLSL shader |
| SpriteAnimator | ✅ | |
| Svg | ✅ | |
| Text | ✅ | |
| Text3D | ✅ | |
| Trail | ✅ | |
| useAnimations | ✅ | |
| useAutolisten | ✅ | |

### Cameras
| Component | Status | Notes |
|-----------|--------|-------|
| CubeCamera | ✅ | |
| CubeTexture | ✅ | |
| Fisheye | ✅ | |
| OrthographicCamera | ✅ | |
| PerspectiveCamera | ✅ | |

### Controls
| Component | Status | Notes |
|-----------|--------|-------|
| ArcballControls | ✅ | |
| CameraControls | ✅ | |
| DeviceOrientationControls | ✅ | |
| DragControls | ✅ | |
| FaceControls | ✅ | |
| FirstPersonControls | ✅ | |
| FlyControls | ✅ | |
| KeyboardControls | ✅ | |
| MapControls | ✅ | |
| MotionPathControls | ✅ | |
| OrbitControls | ✅ | |
| PivotControls | ✅ | |
| PointerLockControls | ✅ | |
| PresentationControls | ✅ | Exported with some limitations |
| ScrollControls | ✅ | Exported with some limitations |
| TrackballControls | ✅ | |
| TransformControls | ✅ | |

### Gizmos
| Component | Status | Notes |
|-----------|--------|-------|
| GizmoHelper | ✅ | |
| GizmoViewcube | ✅ | |
| GizmoViewport | ✅ | |
| Grid | ✅ | |
| useHelper | ✅ | |

### Loaders
| Hook | Status | Notes |
|------|--------|-------|
| useCubeTexture | ✅ | |
| useFBX | ✅ | |
| useFont | ✅ | |
| useGLTF | ✅ | |
| useKTX2 | ✅ | |
| useLoader | ✅ | |
| useProgress | ✅ | |
| useSpriteLoader | ✅ | |
| useTexture | ✅ | |
| useTrailTexture | ✅ | |
| useVideoTexture | ✅ | |

### Misc
| Hook / Component | Status | Notes |
|------------------|--------|-------|
| FaceLandmarker | ✅ | |
| Stats | ✅ | |
| StatsGl | ✅ | |
| useAspect | ✅ | |
| useBoxProjectedEnv | ✅ | |
| useBVH | ✅ | |
| useCamera | ✅ | |
| useContextBridge | ✅ | Rewritten — lazy children via thunk chain |
| useCubeCamera | ✅ | |
| useCursor | ✅ | |
| useDepthBuffer | ✅ | |
| useDetectGPU | ✅ | |
| useFBO | ✅ | |
| useIntersect | ✅ | |
| useTrail | ✅ | |

### Modifiers
| Component | Status | Notes |
|-----------|--------|-------|
| CurveModifier | ✅ | |

### Performance
| Component | Status | Notes |
|-----------|--------|-------|
| AdaptiveDpr | ✅ | Uses usePerformanceMonitor + gl.setPixelRatio |
| AdaptiveEvents | ✅ | Uses usePerformanceMonitor + domElement.style.pointerEvents |
| BakeShadows | ✅ | |
| Detailed | ✅ | |
| Instances | ✅ | |
| Merged | ✅ | |
| meshBounds | ✅ | |
| PerformanceMonitor | ✅ | |
| Points | ✅ | |
| Preload | ✅ | |
| Segments | ✅ | |

### Portals
| Component | Status | Notes |
|-----------|--------|-------|
| Hud | ✅ | |
| Mask | ✅ | |
| MeshPortalMaterial | ✅ | |
| RenderCubeTexture | ✅ | |
| RenderTexture | ✅ | |
| View | ✅ | |

### Shaders / Materials
| Component | Status | Notes |
|-----------|--------|-------|
| MeshDiscardMaterial | ✅ | |
| MeshDistortMaterial | ✅ | |
| MeshReflectorMaterial | ✅ | |
| MeshRefractionMaterial | ✅ | |
| MeshTransmissionMaterial | ✅ | |
| MeshWobbleMaterial | ✅ | |
| MultiMaterial | ✅ | |
| PointMaterial | ✅ | |
| ShadowAlpha | ✅ | |
| shaderMaterial | ✅ | |
| softShadows | ✅ | |

### Shapes
| Component | Status | Notes |
|-----------|--------|-------|
| Box, Sphere, Plane, etc. | ✅ | All primitive shapes |
| RoundedBox | ✅ | |
| ScreenQuad | ✅ | |
| ScreenSizer | ✅ | |

### Staging
| Component | Status | Notes |
|-----------|--------|-------|
| AccumulativeShadows | ✅ | |
| Backdrop | ✅ | |
| BBAnchor | ✅ | |
| Bounds | ✅ | |
| CameraShake | ✅ | |
| Caustics | ✅ | |
| Center | ✅ | |
| Cloud | ✅ | |
| ContactShadows | ✅ | |
| Environment | ✅ | HDRI/EXR/cube + 10 presets (Poly Haven CDN) |
| Float | ✅ | |
| Lightformer | ✅ | |
| Resize | ✅ | |
| Shadow | ✅ | |
| Sky | ✅ | |
| Sparkles | ✅ | |
| SpotLight | ✅ | |
| Stage | ✅ | |
| Stars | ✅ | |
| useMatcapTexture | ✅ | |
| useDreiNormalTexture | ✅ | |
| useSurfaceSampler | ✅ | |
| Wireframe | ✅ | |

### Web
| Component | Status | Notes |
|-----------|--------|-------|
| Html | ✅ | |
| ScreenVideoTexture | ✅ | |
| WebcamVideoTexture | ✅ | |

---

## Omitted

| Component | Reason |
|-----------|--------|
| Reflector | Deprecated upstream — use `MeshReflectorMaterial` |
| useEnvironment | API covered by `Environment` component directly |

---

## Known Gaps

- **Environment advanced**: `frames`, ground projection, and custom children portal not yet implemented.
- **FaceControls**: requires `@mediapipe/tasks-vision` — needs install instructions in README.
- **Publish**: not yet published to npm. Needs final API review + changelog.
