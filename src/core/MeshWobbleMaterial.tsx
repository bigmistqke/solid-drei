import { processProps } from '@/utils'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import type { MeshStandardMaterialParameters, WebGLProgramParametersWithUniforms } from 'three'
import { MeshStandardMaterial } from 'three'

/**********************************************************************************/
/*                                                                                */
/*                                WobbleMaterialImpl                              */
/*                                                                                */
/**********************************************************************************/

interface Uniform<T> {
  value: T
}

interface WobbleMaterialType extends S3.Props<typeof WobbleMaterialImpl> {
  time?: number
  factor?: number
  speed?: number
}

export class WobbleMaterialImpl extends MeshStandardMaterial {
  #time: Uniform<number>
  #factor: Uniform<number>

  constructor(parameters: MeshStandardMaterialParameters = {}) {
    super(parameters)
    this.setValues(parameters)
    this.#time = { value: 0 }
    this.#factor = { value: 1 }
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
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
  speed?: number
}

export function MeshWobbleMaterial(props: MeshWobbleMaterialProps) {
  const [config, rest] = processProps(
    props,
    {
      speed: 1,
    },
    ['speed', 'args'],
  )

  const material = new WobbleMaterialImpl()

  useFrame(state => material && (material.time = state.clock.getElapsedTime() * config.speed))

  return <Entity from={material} attach="material" {...rest} />
}
