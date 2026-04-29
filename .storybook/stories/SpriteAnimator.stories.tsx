import { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Setup } from '../Setup'
import { SpriteAnimator } from '../../src'

const SPRITE_IMAGE = 'story.png'
const SPRITE_DATA = 'story.json'
const CYCLOPS_IMAGE = 'cyclops.png'
const CYCLOPS_JSON = 'cyclops.json'

const meta = {
  title: 'Misc/SpriteAnimator',
  component: SpriteAnimator,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 5] }}>
        <Story />
      </Setup>
    ),
  ],
  args: {
    autoPlay: true,
    loop: true,
    flipX: false,
    startFrame: 0,
    asSprite: false,
    alphaTest: 0.01,
  },
} satisfies Meta<typeof SpriteAnimator>

export default meta
type Story = StoryObj<typeof meta>

export const Animated: Story = {
  render: args => (
    <SpriteAnimator
      {...args}
      textureImageURL={SPRITE_IMAGE}
      textureDataURL={SPRITE_DATA}
      animationNames={['Fly', 'heart', 'sword', 'skull']}
      frameName="Fly"
      fps={18}
      scale={1.5}
    />
  ),
  name: 'Animated',
}

export const Static: Story = {
  render: args => (
    <SpriteAnimator
      {...args}
      textureImageURL={SPRITE_IMAGE}
      textureDataURL={SPRITE_DATA}
      animationNames={['Fly', 'heart', 'sword', 'skull']}
      frameName="sword"
      fps={0}
    />
  ),
  name: 'Static',
}

export const Multiple: Story = {
  render: args => (
    <>
      <SpriteAnimator
        {...args}
        position={[-2, 0, 0.01]}
        textureImageURL={SPRITE_IMAGE}
        textureDataURL={SPRITE_DATA}
        animationNames={['Fly', 'heart', 'sword', 'skull']}
        frameName="Fly"
        fps={18}
      />
      <SpriteAnimator
        {...args}
        position={[-3, 0, 0.01]}
        textureImageURL={SPRITE_IMAGE}
        textureDataURL={SPRITE_DATA}
        animationNames={['Fly', 'heart', 'sword', 'skull']}
        frameName="sword"
        fps={0}
      />
      <SpriteAnimator
        {...args}
        position={[-1, 0, 0.01]}
        textureImageURL={SPRITE_IMAGE}
        textureDataURL={SPRITE_DATA}
        animationNames={['Fly', 'heart', 'sword', 'skull']}
        frameName="heart"
        fps={0}
      />
      <SpriteAnimator
        {...args}
        position={[0, 0, 0.01]}
        textureImageURL={SPRITE_IMAGE}
        textureDataURL={SPRITE_DATA}
        animationNames={['Fly', 'heart', 'sword', 'skull']}
        frameName="skull"
        fps={0}
      />
    </>
  ),
  name: 'Multiple',
}

export const ImageAndJSON: Story = {
  render: args => (
    <SpriteAnimator
      {...args}
      position={[-2, 0, 0.01]}
      textureImageURL={CYCLOPS_IMAGE}
      textureDataURL={CYCLOPS_JSON}
      animationNames={['idle', 'attacking', 'hurt']}
      fps={18}
      scale={2.5}
      frameName="idle"
    />
  ),
  name: 'Image & JSON',
}
