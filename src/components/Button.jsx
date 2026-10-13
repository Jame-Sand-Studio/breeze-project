import React from 'react';
import PropTypes from 'prop-types';

import fanDesktop from '../assets/button/fan.svg';
import fanMobile from '../assets/button/fan-mobile.svg';
import beamPrimaryDesktop from '../assets/button/beam-primary-desktop.svg';
import beamPrimaryMobile from '../assets/button/beam-primary-mobile.svg';
import beamSecondaryDesktop from '../assets/button/beam-secondary-desktop.svg';
import beamSecondaryMobile from '../assets/button/beam-secondary-mobile.svg';

import './Button.css';

const BEAM_LOGOS = {
  primary: { desktop: beamPrimaryDesktop, mobile: beamPrimaryMobile },
  secondary: { desktop: beamSecondaryDesktop, mobile: beamSecondaryMobile },
};

/**
 * Hatari design-system Button.
 *
 * Ported from the Figma component "Button" (node 6518:15173). Figma variant
 * properties map to props as follows:
 *
 * - style=primary / secondary      → `variant="primary" | "secondary"`
 * - style=icon, icon=none          → `variant="icon"` (filled)
 * - style=icon, icon=both          → `variant="icon-outline"`
 * - style=Spining                  → `variant="spinning"` (fan CTA; `loading` also spins it continuously)
 * - device=desktop / mobile        → `size`
 * - icon=none / left / right / both → `iconPosition`
 * - icon=checkout                  → `checkout` (renders the Beam logo)
 * - state=default / hover / press  → native :hover / :active, or `state` to force
 *
 * Icons are a slot (`icon`, any React node) since the glyph varies by usage.
 * The Figma exports for the user and arrow icons live in src/assets/button/.
 */
export const Button = ({
  variant = 'primary',
  size = 'desktop',
  label,
  children,
  icon = null,
  iconRight,
  iconPosition = 'none',
  checkout = false,
  checkoutBadge = null,
  loading = false,
  disabled = false,
  state = null,
  className,
  onClick,
  ...props
}) => {
  const content = label ?? children;
  const isIconOnly = variant === 'icon' || variant === 'icon-outline';
  const hasFan = loading || variant === 'spinning';
  const isCheckout = !isIconOnly && !hasFan && (checkout || Boolean(checkoutBadge));
  const showLeftIcon = !isIconOnly && !hasFan && !isCheckout && icon && (iconPosition === 'left' || iconPosition === 'both');
  const showRightIcon = !isIconOnly && !hasFan && !isCheckout && icon && (iconPosition === 'right' || iconPosition === 'both');

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    hasFan && 'btn--spinning',
    loading && 'btn--loading',
    isCheckout && 'btn--checkout',
    !isIconOnly && !hasFan && !isCheckout && `btn--icon-${showLeftIcon || showRightIcon ? iconPosition : 'none'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const badge =
    checkoutBadge ??
    (checkout && (
      <img
        className="btn__beam"
        src={BEAM_LOGOS[variant === 'secondary' ? 'secondary' : 'primary'][size]}
        alt="Beam"
      />
    ));

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-state={state || undefined}
      onClick={onClick}
      {...props}
    >
      {hasFan && (
        <span className="btn__fan" aria-hidden="true">
          <img className="btn__fan-icon" src={size === 'mobile' ? fanMobile : fanDesktop} alt="" />
        </span>
      )}

      {isIconOnly && (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {showLeftIcon && (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {!isIconOnly && content && (isCheckout ? (
        <span className="btn__checkout">
          <span className="btn__label">{content}</span>
          <span className="btn__badge">{badge}</span>
        </span>
      ) : (
        <span className="btn__label">{content}</span>
      ))}

      {showRightIcon && (
        <span className="btn__icon" aria-hidden="true">
          {iconPosition === 'both' ? iconRight ?? icon : icon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  /** Visual style — mirrors the Figma "style" variant. `icon` is the filled icon-only button, `icon-outline` the outlined one, `spinning` the fan CTA (Figma "Spining"). */
  variant: PropTypes.oneOf(['primary', 'secondary', 'icon', 'icon-outline', 'spinning']),
  /** Size / breakpoint — mirrors the Figma "device" variant. */
  size: PropTypes.oneOf(['desktop', 'mobile']),
  /** Button text. */
  label: PropTypes.node,
  /** Alternative to `label`. */
  children: PropTypes.node,
  /** Icon element rendered per `iconPosition`. The sole content when `variant` is `icon` / `icon-outline`. */
  icon: PropTypes.node,
  /** Trailing icon when `iconPosition="both"` (Figma pairs user + arrow); defaults to `icon`. */
  iconRight: PropTypes.node,
  /** Where `icon` renders relative to the label — mirrors the Figma "icon" variant. */
  iconPosition: PropTypes.oneOf(['none', 'left', 'right', 'both']),
  /** Figma icon=checkout: renders the label in sentence case followed by the Beam payment logo. */
  checkout: PropTypes.bool,
  /** Custom trailing payment-provider badge; overrides the built-in Beam logo. */
  checkoutBadge: PropTypes.node,
  /** Busy state: shows the fan graphic spinning continuously and disables the button. */
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  /** Force a visual state for demoing in Storybook — real usage should rely on native :hover/:active. */
  state: PropTypes.oneOf(['default', 'hover', 'press']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
