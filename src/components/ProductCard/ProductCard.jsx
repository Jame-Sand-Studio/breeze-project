import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../Button';
import './ProductCard.css';

/**
 * Hatari design-system ProductCard.
 *
 * Ported from the Figma component "Product Card" (node 6767:25006). The
 * frame defines a `type` variant (Product / Cover), a `device` variant
 * (desktop / mobile), and a `showDetail` boolean. On desktop, show-detail
 * (or real :hover) swaps in the hover photo, slides in the spec rail and
 * reveals the "Add" button; on mobile it only swaps the photo.
 *
 * Reuses the `Button` component (src/components/Button.jsx) for the
 * "Add" and "Read more" calls to action. Product photography, swatches and
 * spec icons are data props; the Figma exports used by the stories live in
 * src/assets/product-card/.
 */

const isCssColor = (value) => /^(#|rgb|hsl)/i.test(value);

/** A circular icon + label badge used in the desktop spec rail. */
const SpecBadge = ({ icon, label }) => (
  <div className="product-card__spec">
    <span className="product-card__spec-icon" aria-hidden="true">
      {icon}
    </span>
    {label && <p className="product-card__spec-label">{label}</p>}
  </div>
);

SpecBadge.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
};

export const ProductCard = ({
  type = 'product',
  size = 'desktop',
  showDetail = false,
  tag = 'New',
  image,
  hoverImage,
  sku,
  title,
  price,
  originalPrice,
  colorOptions = [],
  specs = [],
  cartIcon = null,
  addLabel = 'Add',
  onAddToCart,
  eyebrow,
  headline,
  ctaLabel = 'Read more',
  onReadMore,
  className,
  ...props
}) => {
  const isCover = type === 'cover';
  const isMobile = size === 'mobile';

  const classes = [
    'product-card',
    `product-card--${size}`,
    isCover && 'product-card--cover',
    !isCover && showDetail && 'product-card--show-detail',
    !isCover && hoverImage && 'product-card--has-hover-image',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isCover) {
    return (
      <article className={classes} data-testid="product-card" {...props}>
        <img className="product-card__cover-image" src={image} alt="" />
        <div className="product-card__cover-text">
          {eyebrow && <p className="product-card__eyebrow">{eyebrow}</p>}
          {headline && <p className="product-card__headline--cover">{headline}</p>}
        </div>
        <Button
          className="product-card__cta"
          variant="spinning"
          size={size}
          label={ctaLabel}
          onClick={onReadMore}
        />
      </article>
    );
  }

  return (
    <article className={classes} data-testid="product-card" {...props}>
      <div className="product-card__wrapper">
        <div className="product-card__media">
          <img className="product-card__image product-card__image--default" src={image} alt={title || ''} />
          {hoverImage && (
            <img className="product-card__image product-card__image--hover" src={hoverImage} alt="" aria-hidden="true" />
          )}
          {tag && <span className="product-card__tag">{tag}</span>}
        </div>

        <div className="product-card__body">
          <div className="product-card__info">
            {sku && <p className="product-card__sku">{sku}</p>}
            {title && <p className="product-card__title">{title}</p>}
            {colorOptions.length > 0 && (
              <div className="product-card__swatches">
                {colorOptions.map((option, i) =>
                  isCssColor(option) ? (
                    <span key={option + i} className="product-card__swatch" style={{ backgroundColor: option }} />
                  ) : (
                    <img key={option + i} className="product-card__swatch" src={option} alt="" />
                  )
                )}
              </div>
            )}
          </div>

          <div className="product-card__price">
            {price && <span className="product-card__price-current">{price}</span>}
            {originalPrice && <span className="product-card__price-original">{originalPrice}</span>}
          </div>

          <Button
            className="product-card__add"
            variant={isMobile ? 'icon' : 'primary'}
            size={size}
            icon={cartIcon}
            iconPosition={isMobile ? 'none' : 'left'}
            label={isMobile ? undefined : addLabel}
            aria-label={isMobile ? (typeof addLabel === 'string' ? addLabel : 'Add') : undefined}
            onClick={onAddToCart}
          />
        </div>
      </div>

      {!isMobile && specs.length > 0 && (
        <div className="product-card__specs">
          {specs.map((spec, i) => (
            <SpecBadge key={spec.label || i} {...spec} />
          ))}
        </div>
      )}
    </article>
  );
};

ProductCard.propTypes = {
  /** Figma "type" variant. */
  type: PropTypes.oneOf(['product', 'cover']),
  /** Figma "device" variant. */
  size: PropTypes.oneOf(['desktop', 'mobile']),
  /** Figma "showDetail": hover photo + spec rail + "Add" button on desktop; hover photo on mobile. Desktop also reveals it on :hover. */
  showDetail: PropTypes.bool,
  /** Corner badge, e.g. "New". Pass `null` to hide it. */
  tag: PropTypes.node,
  /** Resting product photo (Product type) or background photo (Cover type). */
  image: PropTypes.string,
  /** Photo swapped in for the show-detail / hover state (Product type only). */
  hoverImage: PropTypes.string,
  sku: PropTypes.node,
  title: PropTypes.node,
  price: PropTypes.node,
  originalPrice: PropTypes.node,
  /** Swatches: CSS colors (rendered as dots) or image URLs (e.g. the Figma swatch exports). */
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  /** Desktop-only spec rail: `[{ icon, label }]`. Use "\n" in `label` for a line break. */
  specs: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      label: PropTypes.string,
    })
  ),
  /** Icon passed to the internal "Add" Button. */
  cartIcon: PropTypes.node,
  addLabel: PropTypes.node,
  onAddToCart: PropTypes.func,
  /** Cover type only. */
  eyebrow: PropTypes.node,
  headline: PropTypes.node,
  ctaLabel: PropTypes.node,
  onReadMore: PropTypes.func,
  className: PropTypes.string,
};

export default ProductCard;
