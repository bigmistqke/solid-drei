import { createWritable } from '@/utils/create-writable'
import { defaultProps } from '@/utils/default-props'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createEffect, onCleanup } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import { Euler } from 'three'
import { SimplexNoise } from 'three-stdlib'

function constrain(value: number) {
  return Math.max(0, Math.min(1, value))
}

export interface ShakeController {
  getIntensity: () => number
  setIntensity: (val: number) => void
}

export interface CameraShakeProps {
  ref?: Ref<ShakeController>
  intensity?: number
  decay?: boolean
  decayRate?: number
  maxYaw?: number
  maxPitch?: number
  maxRoll?: number
  yawFrequency?: number
  pitchFrequency?: number
  rollFrequency?: number
  controls?: {
    addEventListener(name: string, callback: () => void): void
    removeEventListener(name: string, callback: () => void): void
  }
}

export function CameraShake(props: CameraShakeProps) {
  const config = defaultProps(props, {
    intensity: 1,
    decayRate: 0.65,
    maxYaw: 0.1,
    maxPitch: 0.1,
    maxRoll: 0.1,
    yawFrequency: 0.1,
    pitchFrequency: 0.1,
    rollFrequency: 0.1,
  })

  const [intensity, setIntensity] = createWritable(() => config.intensity)
  function setClampedIntensity(value: number | ((value: number) => number)) {
    if (typeof value === 'number') {
      return setIntensity(constrain(value))
    }
    return setIntensity(intensity => constrain(value(intensity)))
  }

  const store = useThree()
  let initialRotation: Euler = store.camera.rotation.clone()
  const yawNoise = new SimplexNoise()
  const pitchNoise = new SimplexNoise()
  const rollNoise = new SimplexNoise()

  useFrame((state, delta) => {
    const shake = Math.pow(intensity(), 2)
    const yaw =
      config.maxYaw * shake * yawNoise.noise(state.clock.elapsedTime * config.yawFrequency, 1)
    const pitch =
      config.maxPitch * shake * pitchNoise.noise(state.clock.elapsedTime * config.pitchFrequency, 1)
    const roll =
      config.maxRoll * shake * rollNoise.noise(state.clock.elapsedTime * config.rollFrequency, 1)

    store.camera.rotation.set(
      initialRotation.x + pitch,
      initialRotation.y + yaw,
      initialRotation.z + roll,
    )

    if (config.decay && intensity() > 0) {
      setClampedIntensity(intensity => intensity - config.decayRate * delta)
    }
  })

  createEffect(() => {
    if (props.controls) {
      const callback = () => void (initialRotation = store.camera.rotation.clone())
      props.controls.addEventListener('change', callback)
      callback()
      onCleanup(() => {
        props.controls?.removeEventListener('change', callback)
      })
    }
  })

  const methods: ShakeController = {
    getIntensity: intensity,
    setIntensity: setClampedIntensity,
  }

  useRef(config, methods)

  return null
}
