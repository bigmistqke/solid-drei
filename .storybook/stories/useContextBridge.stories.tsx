import { createSignal, createContext, useContext, ComponentProps } from 'solid-js'
import { Canvas } from 'solid-three'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { OrbitControls, Box, Text } from '../../src'

// NOTE: useContextBridge is currently BLOCKED - it lives in src/core/unported/useContextBridge.tsx
// and is not exported from the main index. It requires internal fiber context support.
// This story is kept as a reference for when the component gets ported.
//
// To enable: uncomment the export in src/core/index.ts and src/core/unported/useContextBridge.tsx

function ContextBridge({
  contexts,
  children,
}: { contexts: any[] } & { children?: any }) {
  // useContextBridge(...contexts) // BLOCKED
  return <>{children}</>
}

const meta = {
  title: 'Misc/useContextBridge',
  component: ContextBridge,
} satisfies Meta<typeof ContextBridge>

export default meta
type Story = StoryObj<typeof ContextBridge>

type ThemeContextType = { colors: { red: string; green: string; blue: string } }
type GreetingContextType = {
  name: string
  setName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextType>()
const GreetingContext = createContext<GreetingContextType>()

function Scene() {
  const theme = useContext(ThemeContext)!
  const greeting = useContext(GreetingContext)!
  return (
    <>
      <Box
        position-x={-4}
        args={[3, 2]}
        material-color={theme.colors.red}
        onClick={() => greeting.setName(theme.colors.red)}
      />
      <Box
        position-x={0}
        args={[3, 2]}
        material-color={theme.colors.green}
        onClick={() => greeting.setName(theme.colors.green)}
      />
      <Box
        position-x={4}
        args={[3, 2]}
        material-color={theme.colors.blue}
        onClick={() => greeting.setName(theme.colors.blue)}
      />

      <Suspense fallback={null}>
        <Text fontSize={0.3} position-z={2}>
          {greeting.name ? `Hello ${greeting.name}!` : 'Click a color'}
        </Text>
      </Suspense>
    </>
  )
}

function SceneWrapper() {
  return (
    <Canvas>
      <ContextBridge contexts={[ThemeContext, GreetingContext]}>
        <Scene />
        <OrbitControls enablePan={false} zoomSpeed={0.5} />
      </ContextBridge>
    </Canvas>
  )
}

function UseContextBridgeStory() {
  const [name, setName] = createSignal('')
  return (
    <ThemeContext.Provider value={{ colors: { red: '#ff0000', green: '#00ff00', blue: '#0000ff' } }}>
      <GreetingContext.Provider value={{ name: name(), setName }}>
        <SceneWrapper />
      </GreetingContext.Provider>
    </ThemeContext.Provider>
  )
}

export const Default: Story = {
  render() {
    return <UseContextBridgeStory />
  },
  name: 'Default',
}
