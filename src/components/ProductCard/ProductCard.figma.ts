// url=https://www.figma.com/design/8jTvIjCa9YRiJQecaNxt1u/Hatari-Project--Figma-?node-id=6767-25006
// source=src/components/ProductCard/ProductCard.jsx
// component=ProductCard
import figma from 'figma'
const instance = figma.selectedInstance

// Text layers are not exposed as component properties, so read them by layer name.
const text = (layerName, opts) => {
  const node = instance.findText(layerName, opts)
  return node && node.type === 'TEXT' ? node.textContent : undefined
}

const type = instance.getEnum('type', {
  'Product': 'product',
  'Cover': 'cover',
})
const showDetail = instance.getEnum('show detail', {
  'false': false,
  'true': true,
})
const size = instance.getEnum('device', {
  'desktop': 'desktop',
  'mobile': 'mobile',
})

// The nested Button is rendered by ProductCard itself; only its label is a ProductCard prop.
const buttonLabel = text('Text Label', { traverseInstances: true, path: ['Button'] })

let example
if (type === 'cover') {
  const eyebrow = text('description')
  const headline = text('headline')
  example = figma.code`<ProductCard
  type="cover"
  size="${size}"
  image={coverImage}
  eyebrow="${eyebrow}"
  headline="${headline}"
  ${buttonLabel ? figma.code`ctaLabel="${buttonLabel}"` : ''}
  onReadMore={handleReadMore}
/>`
} else {
  const tag = text('New', { traverseInstances: true, path: ['Tag'] })
  const sku = text('T14M1')
  const title = text('Table Fan')
  const price = text('748 THB')
  const originalPrice = text('1,048 THB')
  example = figma.code`<ProductCard
  size="${size}"
  ${showDetail ? 'showDetail' : ''}
  ${tag ? figma.code`tag="${tag}"` : ''}
  image={productImage}
  hoverImage={productHoverImage}
  sku="${sku}"
  title="${title}"
  price="${price}"
  originalPrice="${originalPrice}"
  colorOptions={colorOptions}
  ${size === 'desktop' ? figma.code`specs={specs}` : ''}
  cartIcon={cartIcon}
  ${size === 'desktop' && buttonLabel ? figma.code`addLabel="${buttonLabel}"` : ''}
  onAddToCart={handleAddToCart}
/>`
}

export default {
  example,
  imports: ['import { ProductCard } from "src/components/ProductCard/ProductCard"'],
  id: 'product-card',
  metadata: { nestable: false },
}
