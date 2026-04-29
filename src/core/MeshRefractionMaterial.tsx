import { processProps } from '@/utils'
import { createEffect, createMemo } from 'solid-js'
import { Entity, type S3, createT, getMeta, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { MeshBVH, MeshBVHUniformStruct, SAH } from 'three-mesh-bvh'
import { MeshRefractionMaterial as MeshRefractionMaterialImpl } from '../materials/MeshRefractionMaterial'

const T = createT({ MeshRefractionMaterial: MeshRefractionMaterialImpl })

const isCubeTexture = (def: THREE.CubeTexture | THREE.Texture): def is THREE.CubeTexture =>
  def && (def as THREE.CubeTexture).isCubeTexture

/**********************************************************************************/
/*                                                                                */
/*                             MeshRefrectionMaterial                             */
/*                                                                                */
/**********************************************************************************/

export type MeshRefractionMaterialProps = Omit<
  S3.Props<typeof MeshRefractionMaterialImpl>,
  'envMap' | 'color'
> & {
  /** Environment map */
  envMap: THREE.CubeTexture | THREE.Texture
  /** Number of ray-cast bounces, it can be expensive to have too many, 2 */
  bounces?: number
  /** Refraction index, 2.4 */
  ior?: number
  /** Fresnel (strip light), 0 */
  fresnel?: number
  /** RGB shift intensity, can be expensive, 0 */
  aberrationStrength?: number
  /** Color, white */
  color?: S3.Color
  /** If this is on it uses fewer ray casts for the RGB shift sacrificing physical accuracy, true */
  fastChroma?: boolean
}

export function MeshRefractionMaterial(_props: MeshRefractionMaterialProps) {
  const [props, rest] = processProps(_props, { aberrationStrength: 0, fastChroma: true }, [
    'aberrationStrength',
    'fastChroma',
    'envMap',
  ])

  let material: InstanceType<typeof MeshRefractionMaterialImpl> = null!
  const store = useThree()

  const defines = createMemo(() => {
    const temp = {} as { [key: string]: string }
    const isCubeMap = isCubeTexture(props.envMap)
    const w = (isCubeMap ? props.envMap.image[0]?.width : props.envMap.image.width) ?? 1024
    const cubeSize = w / 4
    const _lodMax = Math.floor(Math.log2(cubeSize))
    const _cubeSize = Math.pow(2, _lodMax)
    const width = 3 * Math.max(_cubeSize, 16 * 7)
    const height = 4 * _cubeSize
    if (isCubeMap) temp.ENVMAP_TYPE_CUBEM = ''
    temp.CUBEUV_TEXEL_WIDTH = `${1.0 / width}`
    temp.CUBEUV_TEXEL_HEIGHT = `${1.0 / height}`
    temp.CUBEUV_MAX_MIP = `${_lodMax}.0`
    if (props.aberrationStrength > 0) temp.CHROMATIC_ABERRATIONS = ''
    if (props.fastChroma) temp.FAST_CHROMA = ''
    return temp
  })

  createEffect(() => {
    const geometry = getMeta(material)?.parent?.object?.geometry
    if (geometry) {
      material.bvh = new MeshBVHUniformStruct()
      material.bvh.updateFrom(
        new MeshBVH(geometry.clone().toNonIndexed(), { lazyGeneration: false, strategy: SAH }),
      )
    }
  })

  useFrame(({ camera }) => {
    material!.viewMatrixInverse = camera.matrixWorld
    material!.projectionMatrixInverse = camera.projectionMatrixInverse
  })

  return (
    <T.MeshRefractionMaterial
      defines={defines()}
      ref={material!}
      resolution={[store.bounds.width, store.bounds.height]}
      aberrationStrength={props.aberrationStrength}
      envMap={props.envMap}
      {...(rest as any)}
    />
  )
}
