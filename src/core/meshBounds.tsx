import { Matrix4, Ray, Raycaster, Sphere, Vector3, type Intersection, type Mesh } from 'three'

const _inverseMatrix = new Matrix4()
const _ray = new Ray()
const _sphere = new Sphere()
const _vA = new Vector3()

export function meshBounds(this: Mesh, raycaster: Raycaster, intersects: Intersection[]) {
  const geometry = this.geometry
  const material = this.material
  const matrixWorld = this.matrixWorld
  if (material === undefined) return
  if (geometry.boundingSphere === null) geometry.computeBoundingSphere()
  _sphere.copy(geometry.boundingSphere!)
  _sphere.applyMatrix4(matrixWorld)
  if (raycaster.ray.intersectsSphere(_sphere) === false) return
  _inverseMatrix.copy(matrixWorld).invert()
  _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix)
  if (geometry.boundingBox !== null && _ray.intersectBox(geometry.boundingBox, _vA) === null) return
  intersects.push({
    distance: _vA.distanceTo(raycaster.ray.origin),
    point: _vA.clone(),
    object: this,
  })
}
