import { fn } from 'storybook/test';

import { ProductCard } from './ProductCard';

import fanDefault from '../../assets/product-card/fan-default.png';
import fanHover from '../../assets/product-card/fan-hover.png';
import coverImage from '../../assets/product-card/cover.png';
import cartIcon20 from '../../assets/product-card/icon-cart-20.svg';
import cartIcon16 from '../../assets/product-card/icon-cart-16.svg';
import specFanSize from '../../assets/product-card/spec-fan-size.svg';
import specWindLevels from '../../assets/product-card/spec-wind-levels.svg';
import specWarranty from '../../assets/product-card/spec-warranty.svg';
import swatch1 from '../../assets/product-card/swatch-1.svg';
import swatch2 from '../../assets/product-card/swatch-2.svg';
import swatch3 from '../../assets/product-card/swatch-3.svg';
import swatch4 from '../../assets/product-card/swatch-4.svg';
import swatch5 from '../../assets/product-card/swatch-5.svg';
import swatch6 from '../../assets/product-card/swatch-6.svg';
import swatchMobile1 from '../../assets/product-card/swatch-mobile-1.svg';
import swatchMobile2 from '../../assets/product-card/swatch-mobile-2.svg';
import swatchMobile3 from '../../assets/product-card/swatch-mobile-3.svg';
import swatchMobile4 from '../../assets/product-card/swatch-mobile-4.svg';
import swatchMobile5 from '../../assets/product-card/swatch-mobile-5.svg';
import swatchMobile6 from '../../assets/product-card/swatch-mobile-6.svg';

/**
 * All imagery below is exported from the Figma "Product Card" component.
 * Figma has separate swatch and cart-icon exports per device, so the story
 * render picks them from `size`. Note: the Figma cover photo is a grey
 * checkerboard placeholder — pass the real campaign photo as `image`.
 */
const SWATCHES = {
  desktop: [swatch1, swatch2, swatch3, swatch4, swatch5, swatch6],
  mobile: [swatchMobile1, swatchMobile2, swatchMobile3, swatchMobile4, swatchMobile5, swatchMobile6],
};
const CART_ICONS = { desktop: cartIcon20, mobile: cartIcon16 };

const specs = [
  // Figma places the 14" glyph 1.25px right of center in its badge.
  { icon: <img src={specFanSize} alt="" style={{ marginLeft: 2.5 }} />, label: 'Fan Size' },
  { icon: <img src={specWindLevels} alt="" />, label: '3 Wind\nLevels' },
  { icon: <img src={specWarranty} alt="" />, label: '3 Years\nWarranty' },
];

const renderCard = (args) => (
  <ProductCard
    colorOptions={SWATCHES[args.size]}
    cartIcon={<img src={CART_ICONS[args.size]} alt="" />}
    {...args}
  />
);

export default {
  title: 'Components/ProductCard',
  component: ProductCard,
  render: renderCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['product', 'cover'],
      description: 'Figma "type" variant.',
    },
    size: {
      control: 'select',
      options: ['desktop', 'mobile'],
      description: 'Figma "device" variant.',
    },
    showDetail: {
      control: 'boolean',
      description: 'Figma "showDetail". Desktop: hover photo, spec rail and "Add" button. Mobile: hover photo.',
    },
    tag: { control: 'text' },
    sku: { control: 'text' },
    title: { control: 'text' },
    price: { control: 'text' },
    originalPrice: { control: 'text' },
    addLabel: { control: 'text' },
    eyebrow: { control: 'text' },
    headline: { control: 'text' },
    ctaLabel: { control: 'text' },
    image: { control: false },
    hoverImage: { control: false },
    colorOptions: { control: false },
    specs: { control: false },
    cartIcon: { control: false },
  },
  args: {
    onAddToCart: fn(),
    onReadMore: fn(),
    type: 'product',
    size: 'desktop',
    tag: 'New',
    sku: 'T14M1',
    title: 'Table Fan',
    price: '748 THB',
    originalPrice: '1,048 THB',
    specs,
    image: fanDefault,
    hoverImage: fanHover,
  },
};

export const Default = {
  args: {
    showDetail: false,
  },
};

export const HoverShowDetail = {
  name: 'Hover / show detail',
  args: {
    showDetail: true,
  },
};

export const Mobile = {
  args: {
    size: 'mobile',
  },
};

export const MobileShowDetail = {
  name: 'Mobile — show detail',
  args: {
    size: 'mobile',
    showDetail: true,
  },
};

export const NoDiscount = {
  args: {
    originalPrice: null,
  },
};

export const NoTag = {
  args: {
    tag: null,
  },
};

export const Cover = {
  args: {
    type: 'cover',
    image: coverImage,
    eyebrow: 'Portable Fan',
    headline: 'Slide Fan',
    ctaLabel: 'Read more',
  },
};

export const CoverMobile = {
  name: 'Cover — mobile',
  args: {
    type: 'cover',
    size: 'mobile',
    image: coverImage,
    eyebrow: 'Portable Fan',
    headline: 'Slide Fan',
    ctaLabel: 'Read more',
  },
};

/** Every Figma variant, laid out like the Figma frame. */
export const AllVariants = {
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 32 }}>
      {['desktop', 'mobile'].map((size) => (
        <div key={size} style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {renderCard({ ...args, size })}
          {renderCard({ ...args, size, showDetail: true })}
          {renderCard({
            ...args,
            size,
            type: 'cover',
            image: coverImage,
            eyebrow: 'Portable Fan',
            headline: 'Slide Fan',
          })}
        </div>
      ))}
    </div>
  ),
};
