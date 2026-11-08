import type { ReactElement } from 'react'
import { FaUser } from 'react-icons/fa'
import { MdAlternateEmail, MdOutlineLock } from 'react-icons/md'

/**
 * The account page is made of three completely independent sections. Every
 * section has its own form and its own backend endpoint, so they can be
 * released one by one.
 *
 * `available` is `false` for the sections which are not implemented yet: their
 * panel is a preview of the upcoming feature instead of a dead form.
 */
export type AccountSectionKey = 'profile' | 'email' | 'password'

export interface IAccountSection {
  key: AccountSectionKey
  title: string
  description: string
  icon: ReactElement
  available: boolean
  plans: string[]
}

export const ACCOUNT_SECTIONS: IAccountSection[] = [
  {
    key: 'profile',
    title: 'Profile Details',
    description: 'Name, phone number and address',
    icon: <FaUser size={16} />,
    available: true,
    plans: [],
  },
  {
    key: 'email',
    title: 'Email Address',
    description: 'The email you sign in with',
    icon: <MdAlternateEmail size={18} />,
    available: false,
    plans: [
      'Change the email address of your account',
      'Verify the new email before it is activated',
      'Get notified about the important school events',
    ],
  },
  {
    key: 'password',
    title: 'Password',
    description: 'Keep your account secure',
    icon: <MdOutlineLock size={18} />,
    available: true,
    plans: [],
  },
]

export const ACCOUNT_SECTIONS_BY_KEY = ACCOUNT_SECTIONS.reduce(
  (accumulator, section) => {
    accumulator[section.key] = section

    return accumulator
  },
  {} as Record<AccountSectionKey, IAccountSection>
)
