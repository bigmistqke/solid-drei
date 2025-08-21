import type { WidenBooleans } from '@/utils/type-utils'
import * as THREE from 'three'

type ShaderMaterialType<TUniforms extends object> = typeof THREE.ShaderMaterial &
  (new () => THREE.ShaderMaterial & WidenBooleans<TUniforms>) & {
    key: string
  }

export function shaderMaterial<
  TUniforms extends {
    [name: string]:
      | THREE.CubeTexture
      | THREE.Texture
      | Int32Array
      | Float32Array
      | THREE.Matrix4
      | THREE.Matrix3
      | THREE.Quaternion
      | THREE.Vector4
      | THREE.Vector3
      | THREE.Vector2
      | THREE.Color
      | number
      | boolean
      | Array<any>
      | null
  },
>(
  uniforms: TUniforms,
  vertexShader: string,
  fragmentShader: string,
  onInit?: (material?: THREE.ShaderMaterial) => void,
) {
  const material = class extends THREE.ShaderMaterial {
    public key: string = ''
    constructor(parameters = {}) {
      const entries = Object.entries(uniforms)
      // Create unforms and shaders
      super({
        uniforms: entries.reduce(
          (acc, [name, value]) => ({
            ...acc,
            ...THREE.UniformsUtils.clone({ [name]: { value } }),
          }),
          {},
        ),
        vertexShader,
        fragmentShader,
      })
      // Create getter/setters
      entries.forEach(([name]) =>
        Object.defineProperty(this, name, {
          get: () => this.uniforms[name]!.value,
          set: v => (this.uniforms[name]!.value = v),
        }),
      )

      // Assign parameters, this might include uniforms
      Object.assign(this, parameters)
      // Call onInit
      if (onInit) onInit(this)
    }
  } as unknown as ShaderMaterialType<TUniforms>
  material.key = THREE.MathUtils.generateUUID()
  return material
}
