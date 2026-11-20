import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { LOGIN_TOKENS } from '../login/login.styles'

/**
 * Password setup shares the sign-in palette and typography, but it is a single
 * centered card: the user arrives from an email, often on a phone, and only has
 * one job to do.
 */
const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const SetupPage = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: radial-gradient(
      900px 520px at 12% -10%,
      rgba(59, 130, 246, 0.18),
      transparent 62%
    ),
    radial-gradient(
      760px 520px at 100% 0%,
      rgba(124, 58, 237, 0.14),
      transparent 64%
    ),
    ${LOGIN_TOKENS.canvas};

  @media (max-width: 600px) {
    padding: 20px 14px;
    align-items: flex-start;
  }
`

export const SetupCard = styled.section`
  width: 100%;
  max-width: 520px;
  background-color: ${LOGIN_TOKENS.surface};
  border: 1px solid ${LOGIN_TOKENS.border};
  border-radius: 18px;
  padding: 32px clamp(22px, 4vw, 38px) 26px;
  box-shadow: 0 30px 70px -42px rgba(11, 23, 54, 0.45);
  animation: ${rise} 0.35s ease both;
`

export const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
`

export const BrandMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%);
  box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.9);
`

export const BrandName = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: ${LOGIN_TOKENS.ink};
`

export const SetupKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: ${LOGIN_TOKENS.brand};
`

export const SetupTitle = styled.h1`
  margin: 10px 0 0;
  font-size: clamp(22px, 3vw, 26px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${LOGIN_TOKENS.ink};
`

export const SetupSub = styled.p`
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: ${LOGIN_TOKENS.muted};
`

export const SetupForm = styled.form`
  display: grid;
  gap: 20px;
  margin-top: 26px;
`

export const FieldGroup = styled.div`
  display: grid;
  gap: 18px;
`

export const RuleList = styled.ul`
  margin: 4px 0 0;
  padding: 0 0 0 16px;
  display: grid;
  gap: 2px;
  font-size: 11.5px;
  line-height: 1.5;
  color: ${LOGIN_TOKENS.subtle};
`

export const RuleItem = styled.li`
  list-style: disc;
`

export const CapsHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #b45309;
`

export const SuccessIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 18px;
  border-radius: 50%;
  color: #047857;
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
`

export const SetupFooter = styled.footer`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid ${LOGIN_TOKENS.border};
  font-size: 11.5px;
  line-height: 1.5;
  color: ${LOGIN_TOKENS.subtle};
`
