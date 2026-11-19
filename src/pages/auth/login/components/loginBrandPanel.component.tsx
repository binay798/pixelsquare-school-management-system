import {
  BookOpen,
  CalendarCheck,
  FileText,
  GraduationCap,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { LOGIN_BRAND } from '../login.constants'
import {
  BrandBody,
  BrandContent,
  BrandFooter,
  BrandHeadline,
  BrandMark,
  BrandName,
  BrandPanel,
  BrandPlatform,
  BrandSubline,
  BrandTop,
  Eyebrow,
  FeatureDescription,
  FeatureIcon,
  FeatureItem,
  FeatureList,
  FeatureTitle,
  PreviewCard,
  PreviewDots,
  PreviewGrid,
  PreviewHeader,
  PreviewLabel,
  PreviewTile,
  TrustItem,
  TrustList,
} from '../login.styles'

const FEATURE_ICONS = [
  <CalendarCheck key="attendance" size={16} />,
  <Wallet key="fees" size={16} />,
  <MessageSquare key="communication" size={16} />,
]

const MODULE_ICONS = [
  <CalendarCheck key="attendance" size={13} />,
  <BookOpen key="academics" size={13} />,
  <Wallet key="fees" size={13} />,
  <Users key="payroll" size={13} />,
  <MessageSquare key="complaints" size={13} />,
  <FileText key="reports" size={13} />,
]

const TRUST_ICONS = [
  <ShieldCheck key="access" size={12} />,
  <Lock key="encryption" size={12} />,
  <FileText key="audit" size={12} />,
]

/**
 * The left-hand brand experience. Decorative only — every interactive element of
 * the sign-in flow lives on the right, so screen readers can move straight into
 * the form.
 */
export function LoginBrandPanel() {
  const year = new Date().getFullYear()

  return (
    <BrandPanel aria-hidden="true">
      <BrandContent>
        <BrandTop>
          <BrandMark>
            <GraduationCap size={21} />
          </BrandMark>
          <div>
            <BrandName>{LOGIN_BRAND.shortName}</BrandName>
            <BrandPlatform>{LOGIN_BRAND.platform}</BrandPlatform>
          </div>
        </BrandTop>
      </BrandContent>

      <BrandBody>
        <Eyebrow>
          <Sparkles size={13} />
          {LOGIN_BRAND.eyebrow}
        </Eyebrow>

        <BrandHeadline>{LOGIN_BRAND.headline}</BrandHeadline>
        <BrandSubline>{LOGIN_BRAND.description}</BrandSubline>

        <FeatureList>
          {LOGIN_BRAND.features.map((feature, index) => (
            <FeatureItem key={feature.title}>
              <FeatureIcon>{FEATURE_ICONS[index]}</FeatureIcon>
              <div>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </div>
            </FeatureItem>
          ))}
        </FeatureList>

        <PreviewCard>
          <PreviewHeader>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <PreviewDots>
                <i />
                <i />
                <i />
              </PreviewDots>
              <PreviewLabel>Workspace</PreviewLabel>
            </span>
            <ShieldCheck size={14} color="rgba(52, 211, 153, 0.9)" />
          </PreviewHeader>
          <PreviewGrid>
            {LOGIN_BRAND.modules.map((module, index) => (
              <PreviewTile key={module}>
                {MODULE_ICONS[index]}
                {module}
              </PreviewTile>
            ))}
          </PreviewGrid>
        </PreviewCard>
      </BrandBody>

      <BrandFooter>
        <TrustList>
          {LOGIN_BRAND.trust.map((item, index) => (
            <TrustItem key={item}>
              {TRUST_ICONS[index]}
              {item}
            </TrustItem>
          ))}
        </TrustList>
        <span>© {year}</span>
      </BrandFooter>
    </BrandPanel>
  )
}
