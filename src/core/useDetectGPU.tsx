import { getGPUTier, GetGPUTier } from 'detect-gpu'
import { createResource } from 'solid-js'

export function useDetectGPU(props?: GetGPUTier) {
  const [resource] = createResource(() => getGPUTier(props))
  return resource
}
