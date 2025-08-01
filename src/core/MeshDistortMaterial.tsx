import { Ref } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from 'three'
// eslint-disable-next-line
// @ts-ignore
import distort from '../../utils/glsl/distort.vert.glsl'
import { processProps } from '../../utils/process-props'

interface DistortMaterialType extends S3.Props<'MeshPhysicalMaterial'> {
  time?: number
  distort?: number
  radius?: number
}

declare global {
  namespace SolidThree {
    interface IntrinsicElements {
      DistortMaterialImpl: DistortMaterialType
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                              Distort Material Impl                             */
/*                                                                                */
/**********************************************************************************/

interface Uniform<T> {
  value: T
}

class DistortMaterialImpl extends MeshPhysicalMaterial {
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

  onBeforeCompile(shader) {
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
  return <T.Primitive object={material} attach="material" {...rest} />
}
