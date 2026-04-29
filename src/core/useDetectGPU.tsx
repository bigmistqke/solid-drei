import { getGPUTier, type GetGPUTier } from 'detect-gpu'
import { createMemo } from 'solid-js'

export function useDetectGPU(props?: GetGPUTier) {
  return createMemo(async () => getGPUTier(props))
}
