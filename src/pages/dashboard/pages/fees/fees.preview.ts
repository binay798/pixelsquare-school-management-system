import { fromMinor, toMinor } from './fees.helpers'

export interface IDiscountRule {
  discount_type: Fee.DiscountType
  discount_value: string
  maximum_discount_amount?: string | null
  minimum_fee_amount?: string | null
}

export interface IDiscountPreview {
  /** `true` when the rule cannot apply to this base amount. */
  skipped: boolean
  reason?: string
  applied: string
  final_amount: string
  capped: boolean
}

/**
 * Display-only replica of the concession rules of `fee.engine.ts`:
 *
 *  - a percentage is rounded half up on integer minor units,
 *  - a fixed discount can never exceed the remaining amount,
 *  - `maximum_discount_amount` caps the applied discount,
 *  - `minimum_fee_amount` skips the rule below the threshold.
 *
 * The **backend remains authoritative**: the preview is never submitted, the
 * invoice preview endpoint recalculates every line with the real engine.
 */
export const previewDiscount = (
  baseAmount: string,
  rule: IDiscountRule
): IDiscountPreview => {
  const baseMinor = toMinor(baseAmount)

  if (baseMinor <= 0) {
    return {
      skipped: true,
      reason: 'Enter a base amount to preview the discount.',
      applied: fromMinor(0),
      final_amount: fromMinor(0),
      capped: false,
    }
  }

  if (rule.minimum_fee_amount && baseMinor < toMinor(rule.minimum_fee_amount)) {
    return {
      skipped: true,
      reason: 'The base amount is below the minimum required by the rule.',
      applied: fromMinor(0),
      final_amount: fromMinor(baseMinor),
      capped: false,
    }
  }

  let appliedMinor =
    rule.discount_type === 'PERCENTAGE'
      ? Math.round((baseMinor * toMinor(rule.discount_value)) / 10000)
      : Math.min(toMinor(rule.discount_value), baseMinor)

  let capped = false

  if (
    rule.maximum_discount_amount &&
    appliedMinor > toMinor(rule.maximum_discount_amount)
  ) {
    appliedMinor = toMinor(rule.maximum_discount_amount)
    capped = true
  }

  appliedMinor = Math.min(appliedMinor, baseMinor)

  return {
    skipped: false,
    applied: fromMinor(appliedMinor),
    final_amount: fromMinor(baseMinor - appliedMinor),
    capped,
  }
}
