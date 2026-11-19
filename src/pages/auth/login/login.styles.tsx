import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { colors } from '@src/helpers/colors.helpers'

/**
 * Sign-in screen design tokens.
 * The palette is anchored on the app's primary blue (#2463eb) and pushed into a
 * deep indigo range for the brand panel, so the login feels like the same
 * product as the dashboard.
 */
export const LOGIN_TOKENS = {
  ink: '#0b1220',
  muted: '#64748b',
  subtle: '#6b7686',
  border: '#e2e8f2',
  surface: '#ffffff',
  canvas: '#f7f9fd',
  brand: '#2463eb',
  brandDark: '#1d4ed8',
  brandDeep: '#0b1736',
  accent: '#34d399',
}

const drift = keyframes`
  0% {
    transform: translate3d(-3%, -2%, 0) scale(1);
  }
  50% {
    transform: translate3d(3%, 3%, 0) scale(1.08);
  }
  100% {
    transform: translate3d(-1%, 1%, 0) scale(1.02);
  }
`

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const fade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export const LoginPage = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  background-color: ${LOGIN_TOKENS.canvas};

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 1fr);
    background-color: ${LOGIN_TOKENS.surface};
  }
`

/* -------------------------------------------------------------------------- */
/* Brand panel                                                                */
/* -------------------------------------------------------------------------- */

export const BrandPanel = styled.aside`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 44px clamp(40px, 5vw, 64px) 36px;
  color: #eaf1ff;
  background: radial-gradient(
      920px 540px at 10% -12%,
      rgba(59, 130, 246, 0.55),
      transparent 62%
    ),
    radial-gradient(
      760px 520px at 98% 6%,
      rgba(124, 58, 237, 0.48),
      transparent 64%
    ),
    radial-gradient(
      720px 720px at 72% 112%,
      rgba(16, 185, 129, 0.26),
      transparent 62%
    ),
    linear-gradient(160deg, #0a1330 0%, #0b1b44 46%, #070c1f 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.045) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(
      circle at 28% 18%,
      #000 0%,
      transparent 74%
    );
    mask-image: radial-gradient(circle at 28% 18%, #000 0%, transparent 74%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    right: -260px;
    bottom: -280px;
    z-index: -1;
    width: 640px;
    height: 640px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(45, 212, 191, 0.34) 0%,
      transparent 66%
    );
    filter: blur(24px);
    animation: ${drift} 24s ease-in-out infinite alternate;
    pointer-events: none;
  }

  @media (max-width: 1023px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`

export const BrandContent = styled.div`
  position: relative;
  z-index: 1;
  animation: ${fade} 620ms ease both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const BrandTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const BrandMark = styled.span`
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 48%, #1e3a8a 100%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 10px 24px -12px rgba(37, 99, 235, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
`

export const BrandName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #f8fafc;
`

export const BrandPlatform = styled.p`
  margin: 2px 0 0;
  font-size: 11.5px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(226, 236, 255, 0.56);
`

export const BrandBody = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 520px;
  animation: ${rise} 560ms cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #d8ecff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
`

export const BrandHeadline = styled.h2`
  margin: 0;
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1.1;
  letter-spacing: -1.1px;
  font-weight: 700;
  color: #ffffff;
  text-wrap: balance;

  @media (max-height: 900px) {
    font-size: clamp(28px, 2.6vw, 36px);
  }
`

export const BrandSubline = styled.p`
  margin: 0;
  max-width: 46ch;
  font-size: 14.5px;
  line-height: 1.65;
  color: rgba(226, 236, 255, 0.74);
`

export const FeatureList = styled.ul`
  list-style: none;
  margin: 2px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

export const FeatureIcon = styled.span`
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #7dd3fc;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
`

export const FeatureTitle = styled.p`
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: #f1f6ff;
`

export const FeatureDescription = styled.p`
  margin: 3px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: rgba(226, 236, 255, 0.66);
`

export const PreviewCard = styled.div`
  margin-top: 6px;
  padding: 16px;
  @media (max-height: 860px) {
    display: none;
  }
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 24px 50px -30px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
`

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`

export const PreviewDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;

  i {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.24);
  }
`

export const PreviewLabel = styled.span`
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(226, 236, 255, 0.55);
`

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`

export const PreviewTile = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(235, 243, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);

  svg {
    color: rgba(147, 197, 253, 0.95);
    flex-shrink: 0;
  }
`

export const BrandFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11.5px;
  color: rgba(226, 236, 255, 0.5);
`

export const TrustList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`

export const TrustItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(226, 236, 255, 0.62);

  svg {
    color: rgba(52, 211, 153, 0.9);
  }
`

/* -------------------------------------------------------------------------- */
/* Form panel                                                                 */
/* -------------------------------------------------------------------------- */

export const FormPanel = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 26px clamp(22px, 5vw, 56px) 22px;
  background: radial-gradient(
      620px 380px at 100% 0%,
      rgba(36, 99, 235, 0.07),
      transparent 62%
    ),
    ${LOGIN_TOKENS.canvas};

  @media (max-width: 1023px) {
    background: ${LOGIN_TOKENS.surface};
    padding: 18px 20px 24px;
  }

  @media (max-width: 359px) {
    padding-left: 16px;
    padding-right: 16px;
  }
`

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;

  @media (max-width: 359px) {
    gap: 8px;
  }
`

export const MobileBrand = styled.div`
  display: none;
  align-items: center;
  gap: 10px;

  @media (max-width: 1023px) {
    display: flex;
  }
`

export const MobileMark = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 50%, #1e3a8a 100%);
  box-shadow: 0 8px 18px -10px rgba(37, 99, 235, 0.9);
`

export const MobileBrandName = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.1px;
  white-space: nowrap;
  color: ${LOGIN_TOKENS.ink};

  @media (max-width: 359px) {
    display: none;
  }
`

export const HelpLabel = styled.span`
  @media (max-width: 359px) {
    display: none;
  }
`

export const FormArea = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
  padding: 28px 0 36px;

  @media (max-width: 1023px) {
    padding: 24px 0 28px;
  }
`

export const FormShell = styled.section`
  width: 100%;
  max-width: 404px;
  animation: ${rise} 500ms cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const FormKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: ${colors.blue[700]};
`

export const FormHeading = styled.h1`
  margin: 10px 0 0;
  font-size: 29px;
  line-height: 1.15;
  letter-spacing: -0.7px;
  font-weight: 700;
  color: ${LOGIN_TOKENS.ink};
`

export const FormSub = styled.p`
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: ${LOGIN_TOKENS.muted};
`

export const LoginForm = styled.form`
  margin-top: 26px;
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
`

export const FieldLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.15px;
  color: #334155;
`

export const TextLink = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: ${LOGIN_TOKENS.brand};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid ${LOGIN_TOKENS.brand};
    outline-offset: 3px;
  }
`

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: -2px;
`

export const CapsHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: ${colors.amber[800]};
`

export const SecureNote = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 26px 0 0;
  padding-top: 18px;
  border-top: 1px solid ${LOGIN_TOKENS.border};
  font-size: 11.5px;
  line-height: 1.6;
  color: ${LOGIN_TOKENS.subtle};

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: ${colors.green[600]};
  }
`

export const LoginFooter = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  font-size: 11.5px;
  color: ${LOGIN_TOKENS.subtle};

  @media (max-width: 1023px) {
    justify-content: center;
    text-align: center;
  }
`
