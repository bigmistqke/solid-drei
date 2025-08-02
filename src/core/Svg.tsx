import { For, Show, createMemo, onCleanup, splitProps } from 'solid-js'
import { S3, T, useLoader } from 'solid-three'
import { DoubleSide, Object3D } from 'three'
import { SVGLoader } from 'three-stdlib'
import { when } from '../utils/conditionals.ts'

export interface SvgProps extends Omit<S3.Props<'Object3D'>, 'ref'> {
  ref: Object3D
  /** src can be a URL or SVG data */
  src: string
  /** Skip rendering the fill of the SVG paths */
  skipFill?: boolean
  /** Skip rendering the strokes of the SVG paths */
  skipStrokes?: boolean
  /** Material properties for the fill of the SVG paths */
  fillMaterial?: S3.Props<'MeshBasicMaterial'>
  /** Material properties for the strokes of the SVG paths */
  strokeMaterial?: S3.Props<'MeshBasicMaterial'>
  /** Additional properties for the fill meshes */
  fillMeshProps?: S3.Props<'Mesh'>
  /** Additional properties for the stroke meshes */
  strokeMeshProps?: S3.Props<'Mesh'>
}

/**
 * Renders an SVG image using `THREE.SVGLoader`.
 *
 * This component loads and renders an SVG image. You can control the rendering of the fill and stroke
 * of the SVG paths, and customize the materials and mesh properties for both fill and strokes.
 *
 * @example
 * // Using SVG Data
 * ```jsx
 * export default () => {
 *   const svgData = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>';
 *   return (
 *     <Svg
 *       src={svgData}
 *       position={[0, 0, 0]}
 *       skipFill={false}
 *       skipStrokes={false}
 *       fillMaterial={{ color: 'blue' }}
 *       strokeMaterial={{ color: 'green', lineWidth: 2 }}
 *       fillMeshProps={{ castShadow: true }}
 *       strokeMeshProps={{ castShadow: true }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * // Using SVG URL
 * ```jsx
 * export default () => {
 *   const svgUrl = 'https://example.com/my-svg.svg';
 *   return (
 *     <Svg
 *       src={svgUrl}
 *       position={[0, 0, 0]}
 *       skipFill={true}
 *       skipStrokes={false}
 *       strokeMaterial={{ color: 'green', lineWidth: 2 }}
 *       strokeMeshProps={{ castShadow: true }}
 *     />
 *   );
 * }
 * ```
 *
 * @note
 * Ensure the `src` prop is a valid SVG URL or SVG data.
 *
 * @link https://threejs.org/docs/#examples/en/loaders/SVGLoader
 */
export function Svg(props: SvgProps) {
  const [config, rest] = splitProps(props, [
    'src',
    'skipFill',
    'skipStrokes',
    'fillMaterial',
    'strokeMaterial',
    'fillMeshProps',
    'strokeMeshProps',
  ])
  const resource = useLoader(SVGLoader, () =>
    !config.src.startsWith('<svg') ? config.src : `data:image/sv>g+xml;utf8,${config.src}`,
  )

  const strokeGeometries = createMemo(() => {
    return when(resource, svg =>
      config.skipStrokes
        ? []
        : svg.paths.map(path =>
            path.userData?.style.stroke === undefined || path.userData.style.stroke === 'none'
              ? null
              : path.subPaths.map(subPath =>
                  SVGLoader.pointsToStroke(subPath.getPoints(), path.userData!.style),
                ),
          ),
    )
  })

  onCleanup(() => strokeGeometries()?.forEach(group => group && group.map(g => g.dispose())))

  return (
    <T.Object3D {...rest}>
      <T.Object3D scale={[1, -1, 1]}>
        <For each={resource()?.paths}>
          {(path, p) => (
            <>
              <Show
                when={
                  !config.skipFill &&
                  path.userData?.style.fill !== undefined &&
                  path.userData.style.fill !== 'none'
                }
              >
                <For each={SVGLoader.createShapes(path)}>
                  {(shape, s) => (
                    <T.Mesh>
                      <T.ShapeGeometry args={[shape]} />
                      <T.MeshBasicMaterial
                        color={path.userData!.style.fill}
                        opacity={path.userData!.style.fillOpacity}
                        transparent
                        side={DoubleSide}
                        depthWrite={false}
                        {...config.fillMaterial}
                      />
                    </T.Mesh>
                  )}
                </For>
              </Show>
              <Show
                when={
                  !config.skipStrokes &&
                  path.userData?.style.stroke !== undefined &&
                  path.userData.style.stroke !== 'none'
                }
              >
                <For each={path.subPaths}>
                  {(_subPath, s) => (
                    <T.Mesh geometry={strokeGeometries()?.[p()]![s()]} {...config.strokeMeshProps}>
                      <T.MeshBasicMaterial
                        color={path.userData!.style.stroke}
                        opacity={path.userData!.style.strokeOpacity}
                        transparent
                        side={DoubleSide}
                        depthWrite={false}
                        {...config.strokeMaterial}
                      />
                    </T.Mesh>
                  )}
                </For>
              </Show>
            </>
          )}
        </For>
      </T.Object3D>
    </T.Object3D>
  )
}
