import { defaultProps, processProps } from '@/utils'
import { createMemo, createSignal, mergeProps } from 'solid-js'
import { Entity, type S3, useThree } from 'solid-three'
import { pickProps } from 'solid-use/props'
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  Sprite,
  SpriteMaterial,
} from 'three'
import { useGizmoContext } from './GizmoHelper'

type AxisProps = {
  color: string
  rotation: [number, number, number]
  scale?: [number, number, number]
}

type AxisHeadProps = S3.Props<Sprite> & {
  arcStyle: string
  label?: string
  labelColor: string
  axisHeadScale?: number
  disabled?: boolean
  font: string
  onClick?: (e: S3.ThreeEvent<MouseEvent>) => null
}

type GizmoViewportProps = S3.Props<Group> & {
  axisColors?: [string, string, string]
  axisScale?: [number, number, number]
  labels?: [string, string, string]
  axisHeadScale?: number
  labelColor?: string
  hideNegativeAxes?: boolean
  hideAxisHeads?: boolean
  disabled?: boolean
  font?: string
  onClick?: (e: S3.ThreeEvent<MouseEvent>) => null
}

function Axis(_props: AxisProps) {
  const props = defaultProps(_props, {
    scale: [0.8, 0.05, 0.05],
  })
  return (
    <Entity from={Group} rotation={props.rotation}>
      <Entity from={Mesh} position={[0.4, 0, 0]}>
        <Entity from={BoxGeometry} args={props.scale} />
        <Entity from={MeshBasicMaterial} color={props.color} toneMapped={false} />
      </Entity>
    </Entity>
  )
}

function AxisHead(_props: AxisHeadProps) {
  const [props, rest] = processProps(
    _props,
    {
      axisHeadScale: 1,
    },
    ['onClick', 'font', 'disabled', 'arcStyle', 'label', 'labelColor', 'axisHeadScale'],
  )

  const store = useThree()
  const texture = createMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const context = canvas.getContext('2d')!
    context.beginPath()
    context.arc(32, 32, 16, 0, 2 * Math.PI)
    context.closePath()
    context.fillStyle = props.arcStyle
    context.fill()

    if (props.label) {
      context.font = props.font
      context.textAlign = 'center'
      context.fillStyle = props.labelColor
      context.fillText(props.label, 32, 41)
    }
    return new CanvasTexture(canvas)
  })

  const [active, setActive] = createSignal(false)
  const scale = () => (props.label ? 1 : 0.75) * (active() ? 1.2 : 1) * props.axisHeadScale
  const handlePointerOver = (e: S3.ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setActive(true)
  }
  const handlePointerOut = (e: S3.ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setActive(false)
  }
  return (
    <Entity
      from={Sprite}
      scale={scale()}
      onPointerEnter={!props.disabled ? handlePointerOver : undefined}
      onPointerLeave={!props.disabled ? props.onClick || handlePointerOut : undefined}
      {...rest}
    >
      <Entity
        from={SpriteMaterial}
        map={texture()}
        map-anisotropy={store.gl.capabilities.getMaxAnisotropy() || 1}
        alphaTest={0.3}
        opacity={props.label ? 1 : 0.75}
        toneMapped={false}
      />
    </Entity>
  )
}

export const GizmoViewport = (_props: GizmoViewportProps) => {
  const [props, rest] = processProps(
    _props,
    {
      font: '18px Inter var, Arial, sans-serif',
      axisColors: ['#ff2060', '#20df80', '#2080ff'],
      axisHeadScale: 1,
      labels: ['X', 'Y', 'Z'],
      labelColor: '#000',
    },
    [
      'hideNegativeAxes',
      'hideAxisHeads',
      'disabled',
      'font',
      'axisColors',
      'axisHeadScale',
      'axisScale',
      'labels',
      'labelColor',
      'onClick',
    ],
  )

  const { tweenCamera } = useGizmoContext()

  const axisHeadProps = mergeProps(
    {
      onPointerDown: !props.disabled
        ? (e: S3.ThreeEvent<PointerEvent>) => {
            tweenCamera(e.intersection.object.position)
            e.stopPropagation()
          }
        : undefined,
    },
    pickProps(props, ['font', 'disabled', 'labelColor', 'onClick', 'axisHeadScale']),
  )

  return (
    <Entity from={Group} scale={40} {...rest}>
      <Axis color={props.axisColors[0]} rotation={[0, 0, 0]} scale={props.axisScale} />
      <Axis color={props.axisColors[1]} rotation={[0, 0, Math.PI / 2]} scale={props.axisScale} />
      <Axis color={props.axisColors[2]} rotation={[0, -Math.PI / 2, 0]} scale={props.axisScale} />
      {!props.hideAxisHeads && (
        <>
          <AxisHead
            arcStyle={props.axisColors[0]}
            position={[1, 0, 0]}
            label={props.labels[0]}
            {...axisHeadProps}
          />
          <AxisHead
            arcStyle={props.axisColors[1]}
            position={[0, 1, 0]}
            label={props.labels[1]}
            {...axisHeadProps}
          />
          <AxisHead
            arcStyle={props.axisColors[2]}
            position={[0, 0, 1]}
            label={props.labels[2]}
            {...axisHeadProps}
          />
          {!props.hideNegativeAxes && (
            <>
              <AxisHead arcStyle={props.axisColors[0]} position={[-1, 0, 0]} {...axisHeadProps} />
              <AxisHead arcStyle={props.axisColors[1]} position={[0, -1, 0]} {...axisHeadProps} />
              <AxisHead arcStyle={props.axisColors[2]} position={[0, 0, -1]} {...axisHeadProps} />
            </>
          )}
        </>
      )}
    </Entity>
  )
}
