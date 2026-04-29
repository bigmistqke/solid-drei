import * as THREE from 'three'

type Size = { width: number; height: number }

const _tV0 = new THREE.Vector3()
const _tV1 = new THREE.Vector3()
const _tV2 = new THREE.Vector3()

function getPoint2(point3: THREE.Vector3, camera: THREE.Camera, size: Size): THREE.Vector3 {
  const widthHalf = size.width / 2
  const heightHalf = size.height / 2
  camera.updateMatrixWorld(false)
  const vector = point3.project(camera)
  vector.x = vector.x * widthHalf + widthHalf
  vector.y = -(vector.y * heightHalf) + heightHalf
  return vector
}

function getPoint3(
  point2: THREE.Vector3,
  camera: THREE.Camera,
  size: Size,
  zValue: number = 1,
): THREE.Vector3 {
  const vector = _tV0.set(
    (point2.x / size.width) * 2 - 1,
    -(point2.y / size.height) * 2 + 1,
    zValue,
  )
  vector.unproject(camera)
  return vector
}

/**
 * Calculates how many world units correspond to `factor` pixels at a given world position.
 *
 * Projects the 3D position to screen space, offsets by `factor` pixels in X and Y,
 * unprojects back to world space, and returns the largest of the two world-space distances.
 * Works correctly for both perspective and orthographic cameras.
 *
 * @param position - World-space position to measure at
 * @param factor - Number of pixels to convert to world units
 * @param camera - The active Three.js camera
 * @param size - Renderer size `{ width, height }`
 * @returns World-space length corresponding to `factor` pixels at `position`
 *
 * @example
 * ```ts
 * const worldUnitsPerPixel = calculateScaleFactor(mesh.getWorldPosition(v), 1, camera, size)
 * ```
 */
export function calculateScaleFactor(
  position: THREE.Vector3,
  factor: number,
  camera: THREE.Camera,
  size: Size,
): number {
  const point2 = getPoint2(_tV2.copy(position), camera, size)
  let scale = 0
  for (let i = 0; i < 2; ++i) {
    const point2off = _tV1.copy(point2).setComponent(i, point2.getComponent(i) + factor)
    const point3off = getPoint3(point2off, camera, size, point2off.z)
    scale = Math.max(scale, position.distanceTo(point3off))
  }
  return scale
}
