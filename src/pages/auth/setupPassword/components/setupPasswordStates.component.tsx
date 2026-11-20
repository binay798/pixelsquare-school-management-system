import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ButtonComp } from '@src/components/button/button.component'
import { LOGIN_BRAND } from '../../login/login.constants'
import { primaryButtonSx } from '../setupPassword.helpers'
import {
  BrandMark,
  BrandName,
  BrandRow,
  SetupCard,
  SetupPage,
  SetupSub,
  SetupTitle,
  SuccessIcon,
} from '../setupPassword.styles'

export function SetupBrandHeader() {
  return (
    <BrandRow>
      <BrandMark>
        <GraduationCap size={18} />
      </BrandMark>
      <BrandName>{LOGIN_BRAND.shortName}</BrandName>
    </BrandRow>
  )
}

/** Shown when the URL has no `token` query parameter at all. */
export function SetupLinkMissing() {
  const navigate = useNavigate()

  return (
    <SetupPage>
      <SetupCard>
        <SetupBrandHeader />
        <SetupTitle>This link is missing its token</SetupTitle>
        <SetupSub>
          Open the &ldquo;Set up my password&rdquo; button from your invitation
          email again. If the problem continues, ask your school administrator
          to resend the invitation.
        </SetupSub>
        <ButtonComp
          type="button"
          size="large"
          fullWidth
          onClick={() => navigate('/login')}
          sx={{ ...primaryButtonSx, mt: 3 }}
        >
          Back to sign in
        </ButtonComp>
      </SetupCard>
    </SetupPage>
  )
}

/** Shown when the token in the URL cannot be a token this system ever issued. */
export function SetupLinkInvalid() {
  const navigate = useNavigate()

  return (
    <SetupPage>
      <SetupCard>
        <SetupBrandHeader />
        <SetupTitle>This link is not valid</SetupTitle>
        <SetupSub>
          The setup link may have been truncated by your email client, or it may
          have expired. Ask your school administrator to send a new invitation
          and open the button from that email.
        </SetupSub>
        <ButtonComp
          type="button"
          size="large"
          fullWidth
          onClick={() => navigate('/login')}
          sx={{ ...primaryButtonSx, mt: 3 }}
        >
          Back to sign in
        </ButtonComp>
      </SetupCard>
    </SetupPage>
  )
}

/** Shown after the password was stored; the token is already burned. */
export function SetupCompleted() {
  const navigate = useNavigate()

  return (
    <SetupPage>
      <SetupCard>
        <SetupBrandHeader />
        <SuccessIcon>
          <CheckCircle2 size={30} />
        </SuccessIcon>
        <SetupTitle>Your password is set</SetupTitle>
        <SetupSub>
          You can now sign in with your email address and the password you just
          created. This setup link can no longer be used.
        </SetupSub>
        <ButtonComp
          type="button"
          size="large"
          fullWidth
          onClick={() => navigate('/login')}
          sx={{ ...primaryButtonSx, mt: 3 }}
        >
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Go to sign in
            <ArrowRight size={16} />
          </span>
        </ButtonComp>
      </SetupCard>
    </SetupPage>
  )
}
