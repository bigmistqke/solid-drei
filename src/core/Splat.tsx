/**********************************************************************************/
/*                                                                                */
/*                                      Splat                                     */
/*                                                                                */
/**********************************************************************************/

export type SplatProps = {
  /** URL to the .splat file */
  src: string
  /** Optional position */
  position?: [number, number, number]
  /** Optional rotation */
  rotation?: [number, number, number]
  /** Optional scale */
  scale?: [number, number, number] | number
  /** Alpha hash threshold */
  alphaHash?: boolean
  /** Chunk size for streaming */
  chunkSize?: number
  /** Tone mapping toggle */
  toneMapped?: boolean
  /** Whether to use splatting for depth */
  depthWrite?: boolean
  /** Opacity */
  opacity?: number
}

/**
 * 3D Gaussian Splatting renderer stub.
 *
 * The full implementation requires `@pmndrs/gaussian-splats-3d` as a peer dependency.
 * Install it and replace this stub with a full implementation.
 */
export function Splat(props: SplatProps) {
  console.warn(
    '[solid-drei] <Splat> is a stub. The full 3D Gaussian Splatting renderer requires the ' +
      '`@pmndrs/gaussian-splats-3d` peer dependency. ' +
      `Tried to load: ${props.src}`,
  )
  return null
}
