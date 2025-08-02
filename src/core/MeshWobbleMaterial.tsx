import { Ref } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import { MeshStandardMaterial, MeshStandardMaterialParameters } from 'three'
import { processProps } from '../utils/process-props.ts'

declare global {
  namespace SolidThree {
    interface IntrinsicElements {
      WobbleMaterialImpl: WobbleMaterialType
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                WobbleMaterialImpl                              */
/*                                                                                */
/**********************************************************************************/

interface Uniform<T> {
  value: T
}

interface WobbleMaterialType extends S3.Props<'MeshStandardMaterial'> {
  time?: number
  factor?: number
  speed?: number
}

class WobbleMaterialImpl extends MeshStandardMaterial {
  #time: Uniform<number>
  #factor: Uniform<number>

  constructor(parameters: MeshStandardMaterialParameters = {}) {
    super(parameters)
    this.setValues(parameters)
    this.#time = { value: 0 }
    this.#factor = { value: 1 }
  }

  onBeforeCompile(shader: any) {
    shader.uniforms.time = this.#time
    shader.uniforms.factor = this.#factor

    shader.vertexShader = `
      uniform float time;
      uniform float factor;
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `float theta = sin( time + position.y ) / 2.0 * factor;
        float c = cos( theta );
        float s = sin( theta );
        mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
        vec3 transformed = vec3( position ) * m;
        vNormal = vNormal * m;`,
    )
  }

  get time() {
    return this.#time.value
  }

  set time(v) {
    this.#time.value = v
  }

  get factor() {
    return this.#factor.value
  }

  set factor(v) {
    this.#factor.value = v
  }
}

/**********************************************************************************/
/*                                                                                */
/*                               MeshWobbleMaterial                               */
/*                                                                                */
/**********************************************************************************/

interface MeshWobbleMaterialProps extends WobbleMaterialType {
  ref?: Ref<any>
  speed?: number
  factor?: number
}

export function MeshWobbleMaterial(props: MeshWobbleMaterialProps) {
  const [config, rest] = processProps(
    props,
    {
      speed: 1,
    },
    ['ref', 'speed'],
  )

  const material = new WobbleMaterialImpl()

  useFrame(state => material && (material.time = state.clock.getElapsedTime() * config.speed))

  return <T.Primitive object={material} ref={config.ref!} attach="material" {...rest} />
}
