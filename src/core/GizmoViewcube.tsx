import { defaultProps } from '@/utils'
import { createMemo, createSignal, For, Index, onMount, type JSX } from 'solid-js'
import { Entity, useThree, type S3 } from 'solid-three'
import { BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { useGizmoContext } from './GizmoHelper'

type XYZ = [number, number, number]
interface GenericProps {
  font?: string
  opacity?: number
  color?: string
  hoverColor?: string
  textColor?: string
  strokeColor?: string
  onClick?: (e: S3.ThreeEvent<MouseEvent>) => null
  faces?: string[]
}
interface FaceTypeProps extends GenericProps {
  hover: boolean
  index: number
}
interface EdgeCubeProps extends Omit<GenericProps, 'font' & 'color'> {
  dimensions: XYZ
  position: Vector3
}

const COLORS = { bg: '#f0f0f0', hover: '#999', text: 'black', stroke: 'black' }
const DEFAULT_FACES = ['Right', 'Left', 'Top', 'Bottom', 'Front', 'Back']
const makePositionVector = (xyz: [number, number, number]) =>
  new Vector3(...xyz).multiplyScalar(0.38)

const CORNERS: Vector3[] = (
  [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ] satisfies Array<XYZ>
).map(makePositionVector)

const CORNER_DIMENSIONS: XYZ = [0.25, 0.25, 0.25]

const EDGES: Vector3[] = (
  [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [1, -1, 0],
    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1],
    [-1, 1, 0],
    [-1, 0, 1],
    [-1, 0, -1],
    [-1, -1, 0],
  ] satisfies Array<XYZ>
).map(makePositionVector)

const EDGE_DIMENSIONS = EDGES.map(
  edge => edge.toArray().map((axis: number): number => (axis == 0 ? 0.5 : 0.25)) as XYZ,
)

function FaceMaterial(props: FaceTypeProps) {
  const config = defaultProps(props, {
    font: '20px Inter var, Arial, sans-serif',
    faces: DEFAULT_FACES,
    color: COLORS.bg,
    hoverColor: COLORS.hover,
    textColor: COLORS.text,
    strokeColor: COLORS.stroke,
    opacity: 1,
  })

  const store = useThree()
  const texture = createMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')!
    context.fillStyle = config.color
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = config.strokeColor
    context.strokeRect(0, 0, canvas.width, canvas.height)
    context.font = config.font
    context.textAlign = 'center'
    context.fillStyle = config.textColor
    context.fillText(config.faces[config.index].toUpperCase(), 64, 76)
    return new CanvasTexture(canvas)
  })

  return (
    <Entity
      from={MeshBasicMaterial}
      map={texture()}
      map-anisotropy={store.gl.capabilities.getMaxAnisotropy() || 1}
      attach={`material-${config.index}`}
      color={config.hover ? config.hoverColor : 'white'}
      transparent
      opacity={config.opacity}
    />
  )
}

function FaceCube(props: GenericProps) {
  const { tweenCamera } = useGizmoContext()

  const [hover, setHover] = createSignal<number | null>(null)

  return (
    <Entity
      from={Mesh}
      onPointerLeave={() => {
        setHover(null)
      }}
      onPointerMove={(e: S3.ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHover(Math.floor(e.currentIntersection.faceIndex! / 2))
      }}
      onClick={
        props.onClick ||
        (e => {
          e.stopPropagation()
          tweenCamera(e.currentIntersection.face!.normal)
        })
      }
    >
      <Index each={[...Array(6)]}>
        {(_, index) => <FaceMaterial index={index} hover={hover() === index} {...props} />}
      </Index>
      <Entity from={BoxGeometry} />
    </Entity>
  )
}

function EdgeCube(props: EdgeCubeProps): JSX.Element {
  const { tweenCamera } = useGizmoContext()
  const [hover, setHover] = createSignal<boolean>(false)

  return (
    <>
      <Entity
        from={Mesh}
        scale={1.01}
        position={props.position}
        onPointerEnter={() => {
          setHover(true)
        }}
        onPointerLeave={() => {
          setHover(false)
        }}
        onClick={
          props.onClick ||
          ((e: S3.ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            tweenCamera(props.position)
          })
        }
      >
        <Entity
          from={MeshBasicMaterial}
          color={hover() ? props.hoverColor ?? COLORS.hover : 'white'}
          transparent
          opacity={0.6}
          visible={hover()}
        />
        <Entity from={BoxGeometry} args={props.dimensions} />
      </Entity>
    </>
  )
}

export function GizmoViewcube(props: GenericProps) {
  onMount(() => console.log('mount this doogie'))
  return (
    <Entity from={Group} scale={[60, 60, 60]}>
      <FaceCube {...props} />
      <For each={EDGES}>
        {(edge, index) => (
          <EdgeCube position={edge()} dimensions={EDGE_DIMENSIONS[index()]} {...props} />
        )}
      </For>
      <For each={CORNERS}>
        {corner => <EdgeCube position={corner()} dimensions={CORNER_DIMENSIONS} {...props} />}
      </For>
    </Entity>
  )
}
