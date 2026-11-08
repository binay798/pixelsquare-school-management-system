import {
  Card,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import { ACCOUNT_SECTIONS, AccountSectionKey } from '../../account.constants'

interface Props {
  activeSection: AccountSectionKey
  onChange: (section: AccountSectionKey) => void
}

/**
 * Vertical navigation of the account page. Every entry is a separate section,
 * the entries which are not released yet are marked with a `Soon` chip.
 */
export function AccountSectionNav(props: Props) {
  return (
    <Card sx={{ p: 1, width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
      <List disablePadding>
        {ACCOUNT_SECTIONS.map((section) => {
          const isActive = section.key === props.activeSection

          return (
            <ListItemButton
              key={section.key}
              selected={isActive}
              onClick={() => props.onChange(section.key)}
              sx={{
                alignItems: 'flex-start',
                borderRadius: 2,
                py: 1.25,
                mb: 0.5,
                '&.Mui-selected': {
                  background: colors.blue[50],
                },
                '&.Mui-selected:hover': {
                  background: colors.blue[100],
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  mt: 0.25,
                  color: isActive ? 'primary.main' : colors.grey[500],
                }}
              >
                {section.icon}
              </ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Stack
                    direction={'row'}
                    spacing={1}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 600 : 500}
                      color={isActive ? 'primary.main' : 'text.primary'}
                    >
                      {section.title}
                    </Typography>
                    {!section.available ? (
                      <Chip
                        size="small"
                        label="Soon"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 600,
                          background: colors.amber[100],
                          color: colors.amber[900],
                        }}
                      />
                    ) : null}
                  </Stack>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="span"
                  >
                    {section.description}
                  </Typography>
                }
              />
            </ListItemButton>
          )
        })}
      </List>
    </Card>
  )
}
