import { createMemo, splitProps } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { OrbitControls, Sparkles } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'

const meta = {
  title: 'Staging/Sparkles',
  component: Sparkles,
  decorators: [
    StoryFn => (
      <Setup defaultCamera={{ position: [2, 2, 2] }} controls={false}>
        <StoryFn />
      </Setup>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Sparkles',
      },
    },
  },
} satisfies Meta<typeof Sparkles>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                    Sparkles                                    */
/*                                                                                */
/**********************************************************************************/

export const Default: Story = {
  args: {
    size: 5,
    opacity: 1,
    amount: 100,
    speed: 0.3,
    noise: 1,
    random: true,
  },
  argTypes: {
    amount: {
      control: {
        type: 'range',
        min: 0,
        max: 500,
        step: 1,
      },
    },
    noise: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    size: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 1,
      },
    },
    speed: {
      control: {
        type: 'range',
        min: 0,
        max: 20,
        step: 0.1,
      },
    },
    opacity: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
  },
  render(_props) {
    const [props, rest] = splitProps(_props, ['random', 'size', 'amount'])

    const sizes = createMemo(() => {
      return new Float32Array(
        Array.from({ length: props.amount }, () => Math.random() * props.size),
      )
    })

    return (
      <>
        <Sparkles
          {...rest}
          size={props.random ? sizes() : props.size}
          color="orange"
          count={props.amount}
        />
        <OrbitControls />
        <T.AxesHelper />
      </>
    )
  },
}
