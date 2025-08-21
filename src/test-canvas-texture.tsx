import { Entity } from 'solid-three'
import { CanvasTexture } from 'three'

// Test 1: Direct instantiation
const canvas = document.createElement('canvas')
const texture1 = new CanvasTexture(canvas) // This works

// Test 2: Using Entity with args
const TestComponent = () => {
  const canvas = document.createElement('canvas')

  // This should work but might have type issues
  return <Entity from={CanvasTexture} args={[canvas]} />
}

// Test 3: Check the type of args
type CanvasTextureArgs = ConstructorParameters<typeof CanvasTexture>
// This should be: [canvas: TexImageSource | OffscreenCanvas, mapping?: Mapping, ...]

// Test 4: Check S3.Props type
import type { S3 } from 'solid-three'
type CanvasTextureProps = S3.Props<typeof CanvasTexture>
// Check what the args type is here
