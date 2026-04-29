import { processProps } from '@/utils'
import { Show, createEffect, createSignal, on, type ParentProps } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { AmbientLight, Group, PointLight, SpotLight } from 'three'
import { AccumulativeShadows, RandomizedLight, type AccumulativeShadowsProps, type RandomizedLightProps } from './AccumulativeShadows'
import { Bounds, useBounds } from './Bounds'
import { Center, type CenterProps } from './Center'
import { ContactShadows, type ContactShadowsProps } from './ContactShadows'

const presets = {
  rembrandt: { main: [1, 2, 1], fill: [-2, -0.5, -2] },
  portrait:  { main: [-1, 2, 0.5], fill: [-1, 0.5, -1.5] },
  upfront:   { main: [0, 2, 1], fill: [-1, 0.5, -1.5] },
  soft:      { main: [-2, 4, 4], fill: [-1, 0.5, -1.5] },
} as const

type StageShadows = Partial<AccumulativeShadowsProps> &
  Partial<RandomizedLightProps> &
  Partial<ContactShadowsProps> & {
    type: 'contact' | 'accumulative'
    offset?: number
    bias?: number
    normalBias?: number
    size?: number
  }

export type StageProps = ParentProps<{
  preset?: keyof typeof presets | { main: [number, number, number]; fill: [number, number, number] }
  shadows?: boolean | 'contact' | 'accumulative' | StageShadows
  /** Optionally wraps with <Bounds> to fit camera, default: true */
  adjustCamera?: boolean | number
  /** Lighting intensity, default: 0.5 */
  intensity?: number
  center?: Partial<CenterProps>
}>

function Refit(props: { radius: number; adjustCamera: number | boolean }) {
  const api = useBounds()
  createEffect(
    on(
      () => [props.radius, props.adjustCamera],
      () => { if (props.adjustCamera) api?.refresh().clip().fit() },
    ),
  )
  return null
}

export function Stage(_props: StageProps) {
  const [props, rest] = processProps(
    _props,
    {
      adjustCamera: true as boolean | number,
      intensity: 0.5,
      shadows: 'contact' as boolean | 'contact' | 'accumulative' | StageShadows,
      preset: 'rembrandt' as keyof typeof presets | { main: [number, number, number]; fill: [number, number, number] },
    },
    ['children', 'center', 'adjustCamera', 'intensity', 'shadows', 'preset'],
  )

  const config = () => (typeof props.preset === 'string' ? presets[props.preset as keyof typeof presets] : props.preset!)
  const [dimensions, setDimensions] = createSignal({ radius: 0, width: 0, height: 0, depth: 0 })

  const shadowBias    = () => (props.shadows as StageShadows)?.bias ?? -0.0001
  const normalBias    = () => (props.shadows as StageShadows)?.normalBias ?? 0
  const shadowSize    = () => (props.shadows as StageShadows)?.size ?? 1024
  const shadowOffset  = () => (props.shadows as StageShadows)?.offset ?? 0
  const contactShadow = () =>
    props.shadows === 'contact' || (props.shadows as StageShadows)?.type === 'contact'
  const accumulativeShadow = () =>
    props.shadows === 'accumulative' || (props.shadows as StageShadows)?.type === 'accumulative'
  const shadowSpread = () => ({ ...(typeof props.shadows === 'object' ? props.shadows : {}) })

  const onCentered = (centered: any) => {
    const { width, height, depth, boundingSphere } = centered
    setDimensions({ radius: boundingSphere.radius, width, height, depth })
    if (props.center?.onCentered) props.center.onCentered(centered)
  }

  return (
    <>
      <Entity from={AmbientLight} intensity={props.intensity / 3} />
      <Entity
        from={SpotLight}
        penumbra={1}
        position={[
          config().main[0] * dimensions().radius,
          config().main[1] * dimensions().radius,
          config().main[2] * dimensions().radius,
        ]}
        intensity={props.intensity * 2}
        castShadow={!!props.shadows}
        shadow-bias={shadowBias()}
        shadow-normalBias={normalBias()}
        shadow-mapSize={shadowSize()}
      />
      <Entity
        from={PointLight}
        position={[
          config().fill[0] * dimensions().radius,
          config().fill[1] * dimensions().radius,
          config().fill[2] * dimensions().radius,
        ]}
        intensity={props.intensity}
      />
      <Bounds
        fit={!!props.adjustCamera}
        clip={!!props.adjustCamera}
        margin={Number(props.adjustCamera)}
        observe
      >
        <Refit radius={dimensions().radius} adjustCamera={props.adjustCamera} />
        <Center {...props.center} position={[0, shadowOffset() / 2, 0]} onCentered={onCentered}>
          {props.children}
        </Center>
      </Bounds>
      <Entity from={Group} position={[0, -dimensions().height / 2 - shadowOffset() / 2, 0]}>
        <Show when={contactShadow()}>
          <ContactShadows
            scale={dimensions().radius * 4}
            far={dimensions().radius}
            blur={2}
            {...(shadowSpread() as ContactShadowsProps)}
          />
        </Show>
        <Show when={accumulativeShadow()}>
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.9}
            toneMapped
            scale={dimensions().radius * 4}
            {...(shadowSpread() as AccumulativeShadowsProps)}
          >
            <RandomizedLight
              amount={(shadowSpread() as RandomizedLightProps).amount ?? 8}
              radius={(shadowSpread() as RandomizedLightProps).radius ?? dimensions().radius}
              ambient={(shadowSpread() as RandomizedLightProps).ambient ?? 0.5}
              intensity={(shadowSpread() as RandomizedLightProps).intensity ?? 1}
              position={[
                config().main[0] * dimensions().radius,
                config().main[1] * dimensions().radius,
                config().main[2] * dimensions().radius,
              ]}
              size={dimensions().radius * 4}
              bias={-shadowBias()}
              mapSize={shadowSize()}
            />
          </AccumulativeShadows>
        </Show>
      </Entity>
    </>
  )
}
