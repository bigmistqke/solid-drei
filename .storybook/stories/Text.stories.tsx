import { Suspense } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DoubleSide } from 'three'
import { Text } from '../../src'
import { Setup } from '../Setup'
import { T } from '../t'
import { useTurntable } from '../useTurntable'

const meta = {
  title: 'Abstractions/Text',
  component: Text,
  decorators: [
    Story => (
      <Setup defaultCamera={{ position: [0, 0, 200] }}>
        <Story />
      </Setup>
    ),
  ],
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

/**********************************************************************************/
/*                                                                                */
/*                                       Text                                     */
/*                                                                                */
/**********************************************************************************/

const loremText = `LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA. UT ENIM AD MINIM VENIAM, QUIS NOSTRUD EXERCITATION ULLAMCO LABORIS NISI UT ALIQUIP EX EA COMMODO CONSEQUAT. DUIS AUTE IRURE DOLOR IN REPREHENDERIT IN VOLUPTATE VELIT ESSE CILLUM DOLORE EU FUGIAT NULLA PARIATUR. EXCEPTEUR SINT OCCAECAT CUPIDATAT NON PROIDENT, SUNT IN CULPA QUI OFFICIA DESERUNT MOLLIT ANIM ID EST LABORUM.`

export const Default: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        color="#EC2D2D"
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
      >
        {loremText}
      </Text>
    </Suspense>
  ),
}

const arabicText = `إن عدة الشهور عند الله اثنا عشر شهرا في كتاب الله يوم خلق السماوات والارض SOME LATIN TEXT HERE منها أربعة حرم ذلك الدين القيم فلا تظلموا فيهن أنفسكم وقاتلوا المشركين كافة كما يقاتلونكم كافة واعلموا أن الله مع المتقين`

export const Outline: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        color="#EC2D2D"
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={2}
        outlineColor="#ffffff"
      >
        {loremText}
      </Text>
    </Suspense>
  ),
}

export const TransparentWithStroke: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0}
        strokeWidth="2.5%"
        strokeColor="#ffffff"
      >
        {loremText}
      </Text>
    </Suspense>
  ),
}

export const TextShadow: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        color="#EC2D2D"
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
        outlineOffsetX="10%"
        outlineOffsetY="10%"
        outlineBlur="30%"
        outlineOpacity={0.3}
        outlineColor="#EC2D2D"
      >
        {loremText}
      </Text>
    </Suspense>
  ),
}

export const TextRtl: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        color="#EC2D2D"
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="right"
        direction="auto"
        font="https://fonts.gstatic.com/s/scheherazade/v20/YA9Ur0yF4ETZN60keViq1kQgtA.woff"
        anchorX="center"
        anchorY="middle"
      >
        {arabicText}
      </Text>
    </Suspense>
  ),
}

export const CustomMaterial: Story = {
  render: () => (
    <Suspense fallback={null}>
      <Text
        ref={useTurntable()}
        fontSize={12}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
      >
        <T.MeshBasicMaterial side={DoubleSide} color="#EC2D2D" transparent opacity={1} />
        {loremText}
      </Text>
    </Suspense>
  ),
}
