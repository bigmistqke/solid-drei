import type { JSX } from 'solid-js'
import { T, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { defaultProps } from '@/utils/default-props'

/**********************************************************************************/
/*                                                                                */
/*                                    RenderHud                                   */
/*                                                                                */
/**********************************************************************************/

interface RenderHudProps {
  defaultScene: THREE.Scene
  defaultCamera: THREE.Camera
  renderPriority?: number
}

function RenderHud(props: RenderHudProps) {
  const config = defaultProps(props, { renderPriority: 1 })

  const store = useThree()
  let oldClear: boolean

  useFrame(
    () => {
      oldClear = store.gl.autoClear

      if (config.renderPriority === 1) {
        // Clear scene and render the default scene
        store.gl.autoClear = true
        store.gl.render(config.defaultScene, config.defaultCamera)
      }

      // Disable cleaning and render the portal with its own camera
      store.gl.autoClear = false
      store.gl.clearDepth()
      store.gl.render(store.scene, store.camera)

      // Restore default
      store.gl.autoClear = oldClear
    },
    () => config.renderPriority,
  )

  // Without an element that receives pointer events state.pointer will always be 0/0
  return <T.Group onPointerOver={() => null} />
}

/**********************************************************************************/
/*                                                                                */
/*                                       Hud                                      */
/*                                                                                */
/**********************************************************************************/

type HudProps = {
  /** Any React node */
  children: JSX.Element
  /** Render priority, default: 1 */
  renderPriority?: number
}

export function Hud(props: HudProps) {
  const store = useThree()
  const hudScene = new THREE.Scene()
  return (
    <T.Portal
      element={hudScene} /* state={{ events: { priority: (props.renderPriority || 1) + 1 } }} */
    >
      {props.children}
      <RenderHud
        defaultScene={store.scene}
        defaultCamera={store.camera}
        renderPriority={props.renderPriority || 1}
      />
    </T.Portal>
  )
}
