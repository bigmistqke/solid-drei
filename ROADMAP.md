# solid-drei Roadmap

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Ported and story tested |
| 🧪 | Ported, no story yet |
| 🚧 | Partial / needs work |
| ❌ | Not started |
| 🔇 | Intentionally omitted |

---

## Ported Components

### Abstractions
| Component | Status | Notes |
|-----------|--------|-------|
| Billboard | ✅ | |
| CatmullRomLine | ✅ | |
| CubicBezierLine | ✅ | |
| Decal | ✅ | |
| Edges | ✅ | |
| Gltf | ✅ | |
| GradientTexture | ✅ | |
| Image | ✅ | |
| Line | ✅ | |
| MarchingCubes | ✅ | Frame ordering fixed (reset -1, addBall 0, update +1) |
| Outlines | 🧪 | |
| PositionalAudio | ✅ | |
| QuadraticBezierLine | ✅ | |
| Sampler | ✅ | |
| ScreenSpace | ✅ | |
| Splat | 🧪 | Full port: streaming binary loader, Web Worker depth sort, GLSL shader |
| Svg | ✅ | |
| Text | ✅ | |
| Text3D | ✅ | |
| Trail | ✅ | |
| AsciiRenderer | ✅ | |
| Clone | ✅ | |
| ComputedAttribute | ✅ | |
| Facemesh | ✅ | |

### Cameras
| Component | Status | Notes |
|-----------|--------|-------|
| CubeCamera | ✅ | |
| CubeTexture | ✅ | |
| Fisheye | 🧪 | |
| OrthographicCamera | ✅ | |
| PerspectiveCamera | ✅ | |

### Controls
| Component | Status | Notes |
|-----------|--------|-------|
| ArcballControls | ✅ | |
| CameraControls | ✅ | |
| DeviceOrientationControls | ✅ | |
| DragControls | 🧪 | |
| FaceControls | ✅ | |
| FirstPersonControls | ✅ | |
| FlyControls | ✅ | |
| KeyboardControls | ✅ | |
| MapControls | ✅ | |
| MotionPathControls | 🧪 | |
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
| useSpriteLoader | 🧪 | |
| useTexture | ✅ | |
| useTrailTexture | ✅ | |
| useVideoTexture | ✅ | |

### Misc
| Hook / Component | Status | Notes |
|------------------|--------|-------|
| FaceLandmarker | ✅ | |
| useAnimations | ✅ | |
| useAspect | ✅ | |
| useAutolisten | ✅ | |
| useBoxProjectedEnv | ✅ | |
| useBVH | ✅ | |
| useCamera | ✅ | |
| useContextBridge | 🧪 | Rewritten — lazy children, no premature access |
| useCubeCamera | ✅ | |
| useCursor | ✅ | |
| useDepthBuffer | ✅ | |
| useDetectGPU | ✅ | |
| useFBO | ✅ | |
| useHelper | ✅ | |
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
| Merged | 🧪 | |
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
| RenderCubeTexture | 🧪 | |
| RenderTexture | ✅ | |

### Shaders / Materials
| Component | Status | Notes |
|-----------|--------|-------|
| MeshDiscardMaterial | ✅ | |
| MeshDistortMaterial | ✅ | |
| MeshReflectorMaterial | ✅ | |
| MeshRefractionMaterial | ✅ | |
| MeshTransmissionMaterial | ✅ | |
| MeshWobbleMaterial | ✅ | |
| MultiMaterial | 🧪 | |
| PointMaterial | ✅ | |
| ShadowAlpha | 🧪 | |
| shaderMaterial | ✅ | |
| softShadows | ✅ | |

### Shapes
| Component | Status | Notes |
|-----------|--------|-------|
| Box, Sphere, Plane, etc. | ✅ | All primitive shapes |
| RoundedBox | ✅ | |
| ScreenQuad | ✅ | |
| ScreenSizer | 🧪 | |

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
| Environment | 🧪 | HDRI/EXR/cube + presets via Poly Haven CDN |
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
| Wireframe | ✅ | |

### Web
| Component | Status | Notes |
|-----------|--------|-------|
| Html | ✅ | |
| ScreenVideoTexture | 🧪 | |
| WebcamVideoTexture | 🧪 | |

---

## Omitted

| Component | Reason |
|-----------|--------|
| Reflector | Deprecated upstream — use `MeshReflectorMaterial` |
| ScrollControls (full) | Pending solid-three scroll event API |
| useEnvironment | API covered by `Environment` component directly |

---

## Known Gaps / Future Work

- **Stories**: Several ported components (Splat, Fisheye, DragControls, MotionPathControls, useSpriteLoader, MultiMaterial, ShadowAlpha, ScreenSizer, RenderCubeTexture, Merged, ScreenVideoTexture, WebcamVideoTexture, Environment, useContextBridge) still need Storybook stories.
- **Environment advanced**: `frames`, `ground projection`, custom children portal not yet implemented.
- **FaceControls**: Requires `@mediapipe/tasks-vision` — peer dep, needs install instructions.
- **Publish**: Package not yet published to npm. Needs final API review + changelog.
