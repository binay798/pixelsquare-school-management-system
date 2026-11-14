import { Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createAccountAction,
  getAccountOptionsAction,
  updateAccountAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import {
  ACCOUNT_SUBTYPE_BY_TYPE,
  ACCOUNT_SUBTYPE_LABEL,
  ACCOUNT_TYPE_OPTIONS,
  IOption,
} from '../accounting.helpers'

interface Props {
  open: boolean
  account: Accounting.IAccount | null
  onClose: () => void
  onSaved: () => void
}

interface IFormState {
  account_code: string
  account_name: string
  description: string
  account_type: Accounting.AccountType
  account_subtype: string
  parent_account_id: string
  is_active: boolean
}

const emptyForm: IFormState = {
  account_code: '',
  account_name: '',
  description: '',
  account_type: 'ASSET',
  account_subtype: '',
  parent_account_id: '',
  is_active: true,
}

/**
 * Create / edit form of a chart of accounts entry.
 *
 * `PATCH /accounts/:id` only accepts the mutable fields, so the code, the type
 * and the subtype are locked once the account exists.
 */
export function AccountFormModal({ open, account, onClose, onSaved }: Props) {
  const dispatch = useDispatch()
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )
  const { loading: saving } = useSelector(
    (store) => store.accounting.accountMutation
  )

  const [form, setForm] = useState<IFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    dispatch(getAccountOptionsAction({ activeOnly: true }))

    if (account) {
      setForm({
        account_code: account.account_code,
        account_name: account.account_name,
        description: account.description ?? '',
        account_type: account.account_type,
        account_subtype: account.account_subtype ?? '',
        parent_account_id: account.parent_account_id
          ? String(account.parent_account_id)
          : '',
        is_active: account.is_active,
      })

      return
    }

    setForm(emptyForm)
  }, [account, dispatch, open])

  const set = <K extends keyof IFormState>(key: K, value: IFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const subtypeOptions: IOption[] = useMemo(
    () =>
      ACCOUNT_SUBTYPE_BY_TYPE[form.account_type].map(
        (subtype: Accounting.AccountSubtype) => ({
          value: subtype,
          label: ACCOUNT_SUBTYPE_LABEL[subtype],
        })
      ),
    [form.account_type]
  )

  const parentOptions: IOption[] = useMemo(
    () =>
      (accountOptions ?? [])
        .filter((option) => option.id !== account?.id)
        .map((option) => ({
          value: String(option.id),
          label: `${option.account_code} · ${option.account_name}`,
        })),
    [account?.id, accountOptions]
  )

  const validate = () => {
    const next: Record<string, string> = {}

    if (!account && !/^[0-9A-Za-z._-]{2,20}$/.test(form.account_code.trim())) {
      next.account_code = 'Use 2 to 20 letters, digits, dots or dashes.'
    }
    if (form.account_name.trim().length < 2) {
      next.account_name = 'A name of at least 2 characters is required.'
    }

    setErrors(next)

    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate()) {
      return
    }

    if (account) {
      dispatch(
        updateAccountAction({
          accountId: account.id,
          payload: {
            account_name: form.account_name.trim(),
            description: form.description.trim() || null,
            parent_account_id: form.parent_account_id
              ? Number(form.parent_account_id)
              : null,
            is_active: form.is_active,
          },
          onSuccess: () => {
            onClose()
            onSaved()
          },
        })
      )

      return
    }

    dispatch(
      createAccountAction({
        payload: {
          account_code: form.account_code.trim(),
          account_name: form.account_name.trim(),
          description: form.description.trim() || undefined,
          account_type: form.account_type,
          account_subtype: form.account_subtype
            ? (form.account_subtype as Accounting.AccountSubtype)
            : undefined,
          parent_account_id: form.parent_account_id
            ? Number(form.parent_account_id)
            : null,
          is_active: form.is_active,
        },
        onSuccess: () => {
          onClose()
          onSaved()
        },
      })
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="sm">
      <Box sx={{ p: 2.5, minWidth: { xs: 'auto', sm: 520 } }}>
        <Typography fontSize={16} fontWeight={700} color={colors.grey[900]}>
          {account ? 'Edit account' : 'New account'}
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[500]} mt={0.25} mb={2}>
          {account
            ? 'Only the name, description, parent and status of an existing account can change.'
            : 'Accounts follow the double entry model: every account has a normal balance derived from its type.'}
        </Typography>

        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <InputField
                labelDetail={{ text: 'Account code', required: !account }}
                placeholder="1100"
                value={form.account_code}
                disabled={Boolean(account)}
                error={Boolean(errors.account_code)}
                helperText={errors.account_code}
                onChange={(event) => set('account_code', event.target.value)}
              />
            </Box>
            <Box flex={1}>
              <InputField
                labelDetail={{ text: 'Account name', required: true }}
                placeholder="Cash on hand"
                value={form.account_name}
                error={Boolean(errors.account_name)}
                helperText={errors.account_name}
                onChange={(event) => set('account_name', event.target.value)}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Account type
              </Typography>
              <SelectField
                isDisabled={Boolean(account)}
                options={ACCOUNT_TYPE_OPTIONS}
                value={
                  ACCOUNT_TYPE_OPTIONS.find(
                    (option) => option.value === form.account_type
                  ) ?? null
                }
                onChange={(option) => {
                  set(
                    'account_type',
                    (option as IOption<Accounting.AccountType>).value
                  )
                  set('account_subtype', '')
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Subtype
              </Typography>
              <SelectField
                isClearable
                isDisabled={Boolean(account)}
                placeholder="Optional"
                options={subtypeOptions}
                value={
                  subtypeOptions.find(
                    (option) => option.value === form.account_subtype
                  ) ?? null
                }
                onChange={(option) =>
                  set(
                    'account_subtype',
                    (option as IOption | null)?.value ?? ''
                  )
                }
              />
            </Box>
          </Stack>

          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Parent account
            </Typography>
            <SelectField
              isClearable
              placeholder="Top level account"
              options={parentOptions}
              value={
                parentOptions.find(
                  (option) => option.value === form.parent_account_id
                ) ?? null
              }
              onChange={(option) =>
                set(
                  'parent_account_id',
                  (option as IOption | null)?.value ?? ''
                )
              }
            />
          </Box>

          <TextareaField
            labelDetail={{ text: 'Description', required: false }}
            placeholder="Optional internal note"
            variant="outlined"
            minRows={2}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(event) => set('is_active', event.target.checked)}
                size="small"
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Account is active
              </Typography>
            }
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" size="small" onClick={onClose}>
            Cancel
          </ButtonComp>
          <ButtonComp size="small" loading={saving} onClick={submit}>
            {account ? 'Save changes' : 'Create account'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
