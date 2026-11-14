import { Box, Divider, Stack, Typography } from '@mui/material'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getFeeTemplateAction } from '@src/store/redux/dashboard/fee/fee.config.slice'
import { useEffect } from 'react'
import {
  BILLING_FREQUENCY_LABEL,
  formatDate,
  formatMoney,
  TEMPLATE_STATUS_META,
} from '../../../fees.helpers'
import { FeeStatusChip } from '../../../components/feeStatusChip.component'

interface Props {
  open: boolean
  onClose: () => void
  templateId: number | null
  onEdit: (templateId: number) => void
}

/** Read only view of a template and its components. */
export function TemplateDetailModal({
  open,
  onClose,
  templateId,
  onEdit,
}: Props) {
  const dispatch = useDispatch()
  const { data: detail, loading } = useSelector(
    (store) => store.feeConfig.templateDetail
  )

  useEffect(() => {
    if (open && templateId) {
      dispatch(getFeeTemplateAction({ templateId }))
    }
  }, [open, templateId, dispatch])

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box sx={{ minWidth: { xs: 'auto', sm: 620 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography fontSize={16} fontWeight={700} color={colors.grey[900]}>
              {detail?.name ?? 'Fee template'}
            </Typography>
            <Typography fontSize={12} color={colors.grey[500]} mt={0.25}>
              {detail?.code}
              {detail
                ? ` · effective ${formatDate(detail.effective_from)}`
                : ''}
            </Typography>
          </Box>
          {detail ? (
            <FeeStatusChip
              meta={TEMPLATE_STATUS_META[detail.status]}
              size="medium"
            />
          ) : null}
        </Stack>

        <Divider sx={{ my: 1.75 }} />

        {loading && !detail ? (
          <Typography fontSize={13} color={colors.grey[500]}>
            Loading…
          </Typography>
        ) : null}

        {detail ? (
          <Stack spacing={1}>
            {(detail.items ?? []).map((item) => (
              <Stack
                key={item.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: colors.grey[50],
                  border: `1px solid ${colors.grey[100]}`,
                }}
              >
                <Box>
                  <Typography fontSize={13} fontWeight={600}>
                    {item.fee_type_name ?? `Fee #${item.fee_type_id}`}
                  </Typography>
                  <Typography fontSize={11.5} color={colors.grey[500]}>
                    {BILLING_FREQUENCY_LABEL[item.billing_frequency]} · qty{' '}
                    {item.quantity}
                    {item.is_optional ? ' · optional' : ''}
                  </Typography>
                </Box>
                <Typography fontSize={13} fontWeight={600}>
                  {formatMoney(item.amount)}
                </Typography>
              </Stack>
            ))}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 1.25, py: 1 }}
            >
              <Typography
                fontSize={13}
                fontWeight={700}
                color={colors.grey[800]}
              >
                Template total
              </Typography>
              <Typography
                fontSize={16}
                fontWeight={700}
                color={colors.blue[700]}
              >
                {formatMoney(detail.total_amount)}
              </Typography>
            </Stack>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
          <ButtonComp variant="outlined" color="error" onClick={onClose}>
            Close
          </ButtonComp>
          {detail ? (
            <ButtonComp
              onClick={() => {
                onEdit(detail.id)
                onClose()
              }}
            >
              Edit template
            </ButtonComp>
          ) : null}
        </Stack>
      </Box>
    </SpringModal>
  )
}
