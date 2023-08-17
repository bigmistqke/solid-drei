import { createContext } from 'solid-js'
import * as THREE from 'three'

export type OnDragStartProps = {
  component: 'Arrow' | 'Slider' | 'Rotator'
  axis: 0 | 1 | 2
  origin: THREE.Vector3
  directions: THREE.Vector3[]
}

export type PivotContext = {
  onDragStart: (props: OnDragStartProps) => void
  onDrag: (mdW: THREE.Matrix4) => void
  onDragEnd: () => void
  translation: [number, number, number]
  translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
  rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
  axisColors: [string | number, string | number, string | number]
  hoveredColor: string | number
  opacity: number
  scale: number
  lineWidth: number
  fixed: boolean
  depthTest: boolean
  userData?: { [key: string]: any }
  annotations?: boolean
  annotationsClass?: string
}

export const context = createContext<PivotContext>(null!)
