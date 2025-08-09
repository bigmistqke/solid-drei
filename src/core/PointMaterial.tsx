import type { Ref } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import * as THREE from 'three'

/**********************************************************************************/
/*                                                                                */
/*                              Point Material Impl                               */
/*                                                                                */
/**********************************************************************************/

export class PointMaterialImpl extends THREE.PointsMaterial {
  constructor(props: any) {
    super(props)
    this.onBeforeCompile = (shader, renderer) => {
      const { isWebGL2 } = renderer.capabilities
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `
        ${
          !isWebGL2
            ? '#extension GL_OES_standard_derivatives : enable\n#include <output_fragment>'
            : '#include <output_fragment>'
        }
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      float r = dot(cxy, cxy);
      float delta = fwidth(r);     
      float mask = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
      gl_FragColor = vec4(gl_FragColor.rgb, mask * gl_FragColor.a );
      #include <tonemapping_fragment>
      #include <encodings_fragment>
      `,
      )
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                 Point Material                                 */
/*                                                                                */
/**********************************************************************************/

interface PointMaterialProps extends Omit<S3.Props<PointMaterialImpl>, 'attach'> {
  ref: Ref<PointMaterialImpl>
}

export function PointMaterial(props: PointMaterialProps) {
  const material = new PointMaterialImpl(null)
  return <Entity from={material} {...props} attach="material" />
}
