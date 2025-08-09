import { processProps } from '@/utils/process-props'
import type { Ref } from 'solid-js'
import { createRenderEffect } from 'solid-js'
import type { S3 } from 'solid-three'
import { Vector3 } from 'three'
import { Sky as SkyImpl } from 'three-stdlib'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

export function calculatePositionFromAngles(
  inclination: number,
  azimuth: number,
  vector: Vector3 = new Vector3(),
) {
  const theta = Math.PI * (inclination - 0.5)
  const phi = 2 * Math.PI * (azimuth - 0.5)

  vector.x = Math.cos(phi)
  vector.y = Math.sin(theta)
  vector.z = Math.sin(phi)

  return vector
}

/**********************************************************************************/
/*                                                                                */
/*                                       Sky                                      */
/*                                                                                */
/**********************************************************************************/

interface SkyProps {
  ref?: Ref<SkyImpl>
  distance?: number
  sunPosition?: S3.Vector3
  inclination?: number
  azimuth?: number
  mieCoefficient?: number
  mieDirectionalG?: number
  rayleigh?: number
  turbidity?: number
}

export function Sky(props: SkyProps) {
  const [config, rest] = processProps(
    props,
    {
      inclination: 0.6,
      azimuth: 0.1,
      distance: 1000,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      rayleigh: 0.5,
      turbidity: 10,
    },
    [
      'ref',
      'inclination',
      'azimuth',
      'distance',
      'mieCoefficient',
      'mieDirectionalG',
      'rayleigh',
      'turbidity',
      'sunPosition',
    ],
  )

  const sky = new SkyImpl()
  const scale = new Vector3()
  createRenderEffect(() => scale.setScalar(config.distance))

  return (
    <Entity
      object={sky}
      ref={config.ref}
      material-uniforms-mieCoefficient-value={config.mieCoefficient}
      material-uniforms-mieDirectionalG-value={config.mieDirectionalG}
      material-uniforms-rayleigh-value={config.rayleigh}
      material-uniforms-sunPosition-value={
        config.sunPosition || calculatePositionFromAngles(config.inclination, config.azimuth)
      }
      material-uniforms-turbidity-value={config.turbidity}
      scale={scale}
      {...rest}
    />
  )
}
