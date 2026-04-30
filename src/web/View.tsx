import { defaultProps } from '@/utils'
import { Show, children, createEffect, createSignal, type JSX } from 'solid-js'
import { Entity, Portal, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { Group } from 'three'

const isOrthographicCamera = (def: unknown): def is THREE.OrthographicCamera =>
  !!def && (def as THREE.OrthographicCamera).isOrthographicCamera

const col = new THREE.Color()

type CanvasSize = {
  height: number
  width: number
  top?: number
  left?: number
}

function computeContainerPosition(
  canvasSize: CanvasSize,
  trackRect: DOMRect,
): {
  position: {
    width: number
    height: number
    left: number
    top: number
    bottom: number
    right: number
  }
  isOffscreen: boolean
} {
  const { right, top, left: trackLeft, bottom: trackBottom, width, height } = trackRect
  const isOffscreen =
    trackRect.bottom < 0 ||
    top > canvasSize.height ||
    right < 0 ||
    trackRect.left > canvasSize.width

  if (canvasSize.top != null && canvasSize.left != null) {
    const canvasBottom = canvasSize.top + canvasSize.height
    const bottom = canvasBottom - trackBottom
    const left = trackLeft - canvasSize.left
    return { position: { width, height, left, top, bottom, right }, isOffscreen }
  }

  const bottom = canvasSize.height - trackBottom
  return { position: { width, height, top, left: trackLeft, bottom, right }, isOffscreen }
}

export type ContainerProps = {
  scene: THREE.Scene
  index: number
  children?: JSX.Element
  frames: number
  rect: DOMRect
  track: HTMLElement
  canvasSize: CanvasSize
}

function Container(props: ContainerProps) {
  const store = useThree()
  const c = children(() => props.children)

  let frameCount = 0

  useFrame(
    state => {
      if (props.frames === Infinity || frameCount <= props.frames) {
        props.rect = props.track.getBoundingClientRect()
        frameCount++
      }

      if (props.rect) {
        const {
          position: { left, bottom, width, height },
          isOffscreen,
        } = computeContainerPosition(props.canvasSize, props.rect)

        const aspect = width / height

        if (isOrthographicCamera(store.camera)) {
          if (
            store.camera.left !== width / -2 ||
            store.camera.right !== width / 2 ||
            store.camera.top !== height / 2 ||
            store.camera.bottom !== height / -2
          ) {
            Object.assign(store.camera, {
              left: width / -2,
              right: width / 2,
              top: height / 2,
              bottom: height / -2,
            })
            store.camera.updateProjectionMatrix()
          }
        } else {
          const perspCam = store.camera as THREE.PerspectiveCamera
          if (perspCam.aspect !== aspect) {
            perspCam.aspect = aspect
            perspCam.updateProjectionMatrix()
          }
        }

        state.gl.setViewport(left, bottom, width, height)
        state.gl.setScissor(left, bottom, width, height)
        state.gl.setScissorTest(true)

        if (isOffscreen) {
          state.gl.getClearColor(col)
          state.gl.setClearColor(col, state.gl.getClearAlpha())
          state.gl.clear(true, true)
        } else {
          // When children are present render the portalled scene, otherwise the default scene
          state.gl.render(c() ? store.scene : props.scene, store.camera)
        }
        // Restore the default state
        state.gl.setScissorTest(true)
      }
    },
    { priority: props.index },
  )

  return <>{c()}</>
}

export type ViewProps = {
  /** The tracking element, the view will be cut according to its whereabouts */
  track: HTMLElement
  /** Views take over the render loop, optional render index (1 by default) */
  index?: number
  /** If you know your view is always at the same place set this to 1 to avoid needless getBoundingClientRect overhead */
  frames?: number
  /** The scene to render, if you leave this undefined it will render the default scene */
  children?: JSX.Element
}

export const View = (_props: ViewProps) => {
  const props = defaultProps(_props, { index: 1, frames: Infinity })

  let rect: DOMRect = null!
  const store = useThree()
  const virtualScene = new THREE.Scene()

  const [ready, setReady] = createSignal(false)

  createEffect(
    () => props.track,
    () => {
      rect = props.track.getBoundingClientRect()
      setReady(true)
    },
  )

  return (
    <Show when={ready()}>
      <Portal element={virtualScene}>
        <Container
          canvasSize={store.bounds}
          frames={props.frames}
          scene={store.scene}
          track={props.track}
          rect={rect}
          index={props.index}
        >
          {props.children}
          {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
          <Entity from={Group} onPointerMove={() => undefined} />
        </Container>
      </Portal>
    </Show>
  )
}
