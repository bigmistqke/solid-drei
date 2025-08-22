import type { Ref } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import type { MeshPhysicalMaterialParameters, WebGLProgramParametersWithUniforms } from 'three'
import { MeshPhysicalMaterial } from 'three'
// eslint-disable-next-line
// @ts-ignore
import { processProps } from '@/utils'
import distort from '@/utils/glsl/distort.vert.glsl'

interface DistortMaterialType extends S3.Props<typeof MeshPhysicalMaterial> {
  time?: number
  distort?: number
  radius?: number
}

/**********************************************************************************/
/*                                                                                */
/*                              Distort Material Impl                             */
/*                                                                                */
/**********************************************************************************/

interface Uniform<T> {
  value: T
}

export class DistortMaterialImpl extends MeshPhysicalMaterial {
  #time: Uniform<number>
  #distort: Uniform<number>
  #radius: Uniform<number>

  constructor(parameters: MeshPhysicalMaterialParameters = {}) {
    super(parameters)
    this.setValues(parameters)
    this.#time = { value: 0 }
    this.#distort = { value: 0.4 }
    this.#radius = { value: 1 }
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
    shader.uniforms.time = this.#time
    shader.uniforms.radius = this.#radius
    shader.uniforms.distort = this.#distort

    shader.vertexShader = `
      uniform float time;
      uniform float radius;
      uniform float distort;
      ${distort}
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        float updateTime = time / 50.0;
        float noise = snoise(vec3(position / 2.0 + updateTime * 5.0));
        vec3 transformed = vec3(position * (noise * pow(distort, 2.0) + radius));
        `,
    )
  }

  get time() {
    return this.#time.value
  }

  set time(v) {
    this.#time.value = v
  }

  get distort() {
    return this.#distort.value
  }

  set distort(v) {
    this.#distort.value = v
  }

  get radius() {
    return this.#radius.value
  }

  set radius(v) {
    this.#radius.value = v
  }
}

/**********************************************************************************/
/*                                                                                */
/*                              Mesh Distort Material                             */
/*                                                                                */
/**********************************************************************************/

interface MeshDistortMaterialProps extends DistortMaterialType {
  ref?: Ref<MeshPhysicalMaterial>
  speed?: number
  factor?: number
}

export function MeshDistortMaterial(props: MeshDistortMaterialProps) {
  const [config, rest] = processProps(props, { speed: 1 }, ['speed'])
  const material = new DistortMaterialImpl()
  useFrame(state => material && (material.time = state.clock.getElapsedTime() * config.speed))
  return <Entity from={material} attach="material" {...rest} />
}
