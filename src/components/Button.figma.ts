// url=https://www.figma.com/design/8jTvIjCa9YRiJQecaNxt1u/Hatari-Project--Figma-?node-id=6518-15173
// source=src/components/Button.jsx
// component=Button
import figma from 'figma'
const instance = figma.selectedInstance

const style = instance.getEnum('style', {
  'Spining': 'spinning',
  'icon': 'icon',
  'primary': 'primary',
  'secondary': 'secondary',
})
const size = instance.getEnum('device', {
  'desktop': 'desktop',
  'mobile': 'mobile',
})
const iconVariant = instance.getEnum('icon', {
  'left': 'left',
  'right': 'right',
  'both': 'both',
  'none': 'none',
  'checkout': 'checkout',
})
// `state` (default / hover / press) is interaction-only: code uses native :hover / :active,
// so it is intentionally not emitted.

const labelNode = instance.findText('Text Label')
const label = labelNode && labelNode.type === 'TEXT' ? labelNode.textContent : undefined

// The "icon" child is not exposed as a component property, so resolve it by layer name.
// With icon=both there are two of them (leading + trailing).
const icons = instance.findLayers((node) => node.type === 'INSTANCE' && node.name === 'icon')
const firstIcon = icons[0] && icons[0].type === 'INSTANCE' ? icons[0].executeTemplate().example : undefined
const secondIcon = icons[1] && icons[1].type === 'INSTANCE' ? icons[1].executeTemplate().example : undefined

let example
if (style === 'icon') {
  // Figma style=icon, icon=both is the outlined icon-only button.
  const variant = iconVariant === 'both' ? 'icon-outline' : 'icon'
  example = figma.code`<Button
  variant="${variant}"
  size="${size}"
  ${firstIcon ? figma.code`icon={${firstIcon}}` : ''}
  aria-label="${label || 'Open'}"
/>`
} else if (style === 'spinning') {
  example = figma.code`<Button
  variant="spinning"
  size="${size}"
  label="${label}"
/>`
} else if (iconVariant === 'checkout') {
  // The nested "payment provider" (logo=Beam) is the built-in badge rendered by `checkout`.
  example = figma.code`<Button
  variant="${style}"
  size="${size}"
  label="${label}"
  checkout
/>`
} else {
  example = figma.code`<Button
  variant="${style}"
  size="${size}"
  label="${label}"
  iconPosition="${iconVariant}"
  ${firstIcon ? figma.code`icon={${firstIcon}}` : ''}
  ${iconVariant === 'both' && secondIcon ? figma.code`iconRight={${secondIcon}}` : ''}
/>`
}

export default {
  example,
  imports: ['import { Button } from "src/components/Button"'],
  id: 'button',
  metadata: { nestable: true },
}
