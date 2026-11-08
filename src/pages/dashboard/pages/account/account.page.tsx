import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useSelector } from '@src/store/hooks.store'
import { ACCOUNT_SECTIONS_BY_KEY, AccountSectionKey } from './account.constants'
import { AccountSectionNav } from './components/accountSectionNav/accountSectionNav.component'
import { ChangePasswordForm } from './components/changePasswordForm/changePasswordForm.component'
import { ProfileDetailsForm } from './components/profileDetailsForm/profileDetailsForm.component'
import { AccountComingSoonPanel } from './components/accountComingSoonPanel/accountComingSoonPanel.component'

/**
 * Account page of the logged in user.
 *
 * The three sections (profile details, email, password) are completely
 * independent of each other: each one owns its panel, its form and its own
 * backend endpoint. The email section is still to come.
 */
export function AccountPage() {
  const [activeSection, setActiveSection] =
    useState<AccountSectionKey>('profile')
  const email = useSelector((store) => store.auth.user.data?.user?.email)
  const section = ACCOUNT_SECTIONS_BY_KEY[activeSection]

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Account
        </Typography>
        <Typography variant="body2" mt={1}>
          Manage your profile details, email address and password. Every section
          is saved on its own.
          {email ? ` Signed in as ${email}.` : ''}
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={'flex-start'}
      >
        <AccountSectionNav
          activeSection={activeSection}
          onChange={setActiveSection}
        />

        <Box flex={1} width={'100%'} minWidth={0}>
          {!section.available ? (
            <AccountComingSoonPanel section={section} />
          ) : section.key === 'profile' ? (
            <ProfileDetailsForm />
          ) : (
            <ChangePasswordForm />
          )}
        </Box>
      </Stack>
    </Box>
  )
}
