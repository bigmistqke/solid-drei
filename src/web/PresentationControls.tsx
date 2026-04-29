import { defaultProps } from '@/utils'
import { createEffect, createSignal, type JSX } from 'solid-js'
import { Entity, useThree } from 'solid-three'
import { Group, MathUtils, Vector2 } from 'three'

export type PresentationControlProps = {
  snap?: boolean
  global?: boolean
  cursor?: boolean
  speed?: number
  zoom?: number
  rotation?: [number, number, number]
  polar?: [number, number]
  azimuth?: [number, number]
  enabled?: boolean
  children?: JSX.Element
  domElement?: HTMLElement
}

export function PresentationControls(_props: PresentationControlProps) {
  const props = defaultProps(_props, {
    enabled: true,
    snap: false,
    global: false,
    cursor: true,
    speed: 1,
    zoom: 1,
    rotation: [0, 0, 0] as [number, number, number],
    polar: [0, Math.PI / 2] as [number, number],
    azimuth: [-Infinity, Infinity] as [number, number],
  })

  const store = useThree()
  let group: Group = null!

  const rPolarMin = () => props.rotation[0] + props.polar[0]
  const rPolarMax = () => props.rotation[0] + props.polar[1]
  const rAzimuthMin = () => props.rotation[1] + props.azimuth[0]
  const rAzimuthMax = () => props.rotation[1] + props.azimuth[1]

  const [rotX, setRotX] = createSignal(() =>
    MathUtils.clamp(props.rotation[0], rPolarMin(), rPolarMax()),
  )
  const [rotY, setRotY] = createSignal(() =>
    MathUtils.clamp(props.rotation[1], rAzimuthMin(), rAzimuthMax()),
  )
  const [scale, setScale] = createSignal(1)

  const getDomElement = () => props.domElement || store.gl.domElement

  createEffect(
    () => props.enabled,
    () => {
      if (!props.enabled) return
      const domEl = getDomElement()

      let isDragging = false
      const last = new Vector2()

      const onPointerDown = (e: PointerEvent) => {
        if (!props.enabled) return
        isDragging = true
        last.set(e.clientX, e.clientY)
        if (props.cursor) domEl.style.cursor = 'grabbing'
      }

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging || !props.enabled) return
        const dx = e.clientX - last.x
        const dy = e.clientY - last.y
        last.set(e.clientX, e.clientY)

        const { width, height } = store.bounds
        const newY = MathUtils.clamp(
          rotX() + (dy / height) * Math.PI * props.speed,
          rPolarMin(),
          rPolarMax(),
        )
        const newX = MathUtils.clamp(
          rotY() + (dx / width) * Math.PI * props.speed,
          rAzimuthMin(),
          rAzimuthMax(),
        )
        setRotX(newY)
        setRotY(newX)

        if (newY > (rPolarMin() + rPolarMax()) / 2) {
          setScale(props.zoom)
        } else {
          setScale(1)
        }
      }

      const onPointerUp = () => {
        isDragging = false
        if (props.cursor) domEl.style.cursor = props.global ? 'grab' : 'auto'
        if (props.snap) {
          setRotX(MathUtils.clamp(props.rotation[0], rPolarMin(), rPolarMax()))
          setRotY(MathUtils.clamp(props.rotation[1], rAzimuthMin(), rAzimuthMax()))
          setScale(1)
        }
      }

      const onHoverIn = () => {
        if (props.cursor && !props.global && props.enabled) domEl.style.cursor = 'grab'
      }
      const onHoverOut = () => {
        if (props.cursor && !props.global && props.enabled) domEl.style.cursor = 'auto'
      }

      if (props.global) {
        if (props.cursor) domEl.style.cursor = 'grab'
        domEl.addEventListener('pointerdown', onPointerDown)
        domEl.addEventListener('pointermove', onPointerMove)
        domEl.addEventListener('pointerup', onPointerUp)
      }

      return () => {
        if (props.global) {
          if (props.cursor) domEl.style.cursor = 'default'
          domEl.removeEventListener('pointerdown', onPointerDown)
          domEl.removeEventListener('pointermove', onPointerMove)
          domEl.removeEventListener('pointerup', onPointerUp)
        }
      }
    },
  )

  return (
    <Entity
      from={Group}
      ref={(g: Group) => (group = g)}
      rotation={[rotX(), rotY(), props.rotation[2]]}
      scale={scale()}
      onPointerDown={(e: { nativeEvent: PointerEvent }) => {
        if (!props.enabled || props.global) return
        const domEl = getDomElement()
        let isDragging = true
        const last = new Vector2()
        const nativeEvent = e.nativeEvent
        last.set(nativeEvent.clientX, nativeEvent.clientY)
        if (props.cursor) domEl.style.cursor = 'grabbing'

        const onMove = (ev: PointerEvent) => {
          if (!isDragging) return
          const dx = ev.clientX - last.x
          const dy = ev.clientY - last.y
          last.set(ev.clientX, ev.clientY)

          const { width, height } = store.bounds
          const newY = MathUtils.clamp(
            rotX() + (dy / height) * Math.PI * props.speed,
            rPolarMin(),
            rPolarMax(),
          )
          const newX = MathUtils.clamp(
            rotY() + (dx / width) * Math.PI * props.speed,
            rAzimuthMin(),
            rAzimuthMax(),
          )
          setRotX(newY)
          setRotY(newX)
        }
        const onUp = () => {
          isDragging = false
          if (props.cursor) domEl.style.cursor = 'auto'
          if (props.snap) {
            setRotX(MathUtils.clamp(props.rotation[0], rPolarMin(), rPolarMax()))
            setRotY(MathUtils.clamp(props.rotation[1], rAzimuthMin(), rAzimuthMax()))
            setScale(1)
          }
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
      }}
    >
      {props.children}
    </Entity>
  )
}
