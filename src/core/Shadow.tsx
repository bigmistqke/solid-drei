import { processProps } from '@/utils/process-props'
import { createMemo, onMount, type Ref } from 'solid-js'
import { createT, type S3 } from 'solid-three'
import { CanvasTexture, Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

const T = createT({
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  CanvasTexture,
})

interface ShadowProps extends S3.Props<Mesh> {
  ref?: Ref<Mesh>
  colorStop?: number
  fog?: boolean
  color?: Color | number | string
  opacity?: number
  depthWrite?: boolean
}

export function Shadow(props: ShadowProps) {
  const [config, rest] = processProps(
    props,
    { fog: false, depthWrite: false, colorStop: 0.0, color: 'black', opacity: 0.5 },
    ['ref', 'fog', 'renderOrder', 'depthWrite', 'colorStop', 'color', 'opacity'],
  )
  const mat = new MeshBasicMaterial()

  const canvas = createMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    )
    gradient.addColorStop(config.colorStop, new Color(config.color).getStyle())
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    return canvas
  })

  onMount(() => (mat.needsUpdate = true))

  return (
    <T.Mesh ref={config.ref} renderOrder={config.renderOrder} rotation-x={-Math.PI / 2} {...rest}>
      <T.PlaneGeometry />
      <Entity
        object={mat}
        transparent={true}
        opacity={config.opacity}
        fog={config.fog}
        depthWrite={config.depthWrite}
        side={DoubleSide}
        ref={mat!}
      >
        <T.CanvasTexture attach="map" args={[canvas()]} />
      </Entity>
    </T.Mesh>
  )
}
