import { Canvas, T, extend } from 'solid-three'
import * as THREE from 'three'
import { Box } from './Box'
import './app.css'

extend(THREE)

export default function App() {
  return (
    <Canvas camera={{ position: new THREE.Vector3(0, 0, 5) }}>
      <T.AmbientLight color={[0.2, 0.2, 0.2]} />
      <T.PointLight intensity={1.2} decay={1} position={[2, 2, 5]} rotation={[0, Math.PI / 3, 0]} />
      <Box />
    </Canvas>
  )
}
