import { fn } from 'storybook/test';

import { Button } from './Button';

import userWhite20 from '../assets/button/icon-user-white-20.svg';
import userBlack20 from '../assets/button/icon-user-black-20.svg';
import userWhite16 from '../assets/button/icon-user-white-16.svg';
import userBlack16 from '../assets/button/icon-user-black-16.svg';
import arrowWhite20 from '../assets/button/icon-arrow-white-20.svg';
import arrowBlack20 from '../assets/button/icon-arrow-black-20.svg';
import arrowWhite16 from '../assets/button/icon-arrow-white-16.svg';
import arrowBlack16 from '../assets/button/icon-arrow-black-16.svg';

/**
 * Icon exports from the Figma Button component. Figma ships a white copy
 * (on brand-filled buttons) and a black copy (on white buttons) at each
 * size, so stories pick the right file from `variant` + `size`.
 */
const ICONS = {
  user: {
    white: { desktop: userWhite20, mobile: userWhite16 },
    black: { desktop: userBlack20, mobile: userBlack16 },
  },
  arrow: {
    white: { desktop: arrowWhite20, mobile: arrowWhite16 },
    black: { desktop: arrowBlack20, mobile: arrowBlack16 },
  },
};

const iconFor = (name, variant, size) => {
  if (!name) return null;
  const tone = variant === 'secondary' || variant === 'icon-outline' ? 'black' : 'white';
  return <img src={ICONS[name][tone][size]} alt="" />;
};

// Figma uses the user icon on the left and the arrow on the right / icon-only.
const renderButton = ({ iconName, ...args }) => {
  const name =
    iconName ?? (args.variant === 'icon' || args.variant === 'icon-outline' || args.iconPosition === 'right' ? 'arrow' : 'user');
  const hasIcon = args.iconPosition !== 'none' || args.variant?.startsWith('icon');
  return (
    <Button
      {...args}
      icon={hasIcon ? iconFor(name, args.variant, args.size) : null}
      iconRight={args.iconPosition === 'both' ? iconFor('arrow', args.variant, args.size) : undefined}
    />
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Button',
  component: Button,
  render: renderButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/arg-types
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'icon', 'icon-outline', 'spinning'],
      description: 'Figma "style" variant. `icon-outline` is Figma style=icon, icon=both; `spinning` is Figma "Spining".',
    },
    size: {
      control: 'select',
      options: ['desktop', 'mobile'],
      description: 'Figma "device" variant.',
    },
    iconPosition: {
      control: 'select',
      options: ['none', 'left', 'right', 'both'],
      description: 'Figma "icon" variant. Ignored for icon-only variants.',
    },
    iconName: {
      control: 'select',
      options: ['user', 'arrow'],
      description: 'Story-only: which Figma icon export to pass as `icon`.',
      table: { category: 'Story' },
    },
    state: {
      control: 'select',
      options: [null, 'default', 'hover', 'press'],
      description: 'Force a visual state for review. Leave unset to use real :hover/:active.',
    },
    label: { control: 'text' },
    checkout: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: false },
    iconRight: { control: false },
    checkoutBadge: { control: false },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: {
    onClick: fn(),
    label: 'Text Label',
    variant: 'primary',
    size: 'desktop',
    iconPosition: 'left',
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
  },
};

export const IconRight = {
  args: {
    variant: 'primary',
    iconPosition: 'right',
  },
};

export const IconBothSides = {
  args: {
    variant: 'primary',
    iconPosition: 'both',
  },
};

export const NoIcon = {
  args: {
    variant: 'secondary',
    iconPosition: 'none',
  },
};

export const IconOnly = {
  args: {
    variant: 'icon',
    label: undefined,
    'aria-label': 'Open',
  },
};

export const IconOnlyOutline = {
  args: {
    variant: 'icon-outline',
    label: undefined,
    'aria-label': 'Open',
  },
};

export const Checkout = {
  args: {
    variant: 'primary',
    iconPosition: 'none',
    checkout: true,
  },
};

export const CheckoutSecondary = {
  args: {
    variant: 'secondary',
    iconPosition: 'none',
    checkout: true,
  },
};

export const Spinning = {
  name: 'Spinning (fan CTA)',
  args: {
    variant: 'spinning',
    iconPosition: 'none',
    label: 'Read more',
  },
};

export const Loading = {
  args: {
    variant: 'primary',
    iconPosition: 'none',
    loading: true,
  },
};

export const Mobile = {
  args: {
    variant: 'primary',
    size: 'mobile',
  },
};

export const Disabled = {
  args: {
    variant: 'primary',
    disabled: true,
  },
};

export const HoverState = {
  name: 'Forced hover state',
  args: {
    variant: 'primary',
    state: 'hover',
  },
};

export const PressState = {
  name: 'Forced press state',
  args: {
    variant: 'primary',
    state: 'press',
  },
};

/** Every Figma variant side by side, laid out like the Figma frame (rows = state, grouped by device). */
export const AllVariants = {
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
  render: () => {
    const columns = [
      { variant: 'spinning', iconPosition: 'none' },
      { variant: 'primary', iconPosition: 'left' },
      { variant: 'primary', iconPosition: 'right' },
      { variant: 'primary', iconPosition: 'both' },
      { variant: 'primary', iconPosition: 'none' },
      { variant: 'primary', iconPosition: 'none', checkout: true },
      { variant: 'icon', label: undefined, 'aria-label': 'Open' },
      { variant: 'secondary', iconPosition: 'left' },
      { variant: 'secondary', iconPosition: 'right' },
      { variant: 'secondary', iconPosition: 'both' },
      { variant: 'secondary', iconPosition: 'none' },
      { variant: 'secondary', iconPosition: 'none', checkout: true },
      { variant: 'icon-outline', label: undefined, 'aria-label': 'Open' },
    ];
    return (
      <div style={{ display: 'grid', gap: 32 }}>
        {['desktop', 'mobile'].map((size) => (
          <div key={size} style={{ display: 'grid', gap: 12 }}>
            {['default', 'hover', 'press'].map((state) => (
              <div key={state} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {columns.map((col, i) => (
                  <span key={i}>{renderButton({ label: 'Text Label', variant: 'primary', size, state, ...col })}</span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
