import { Box, Button, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getMyPayslipsAction } from '@src/store/redux/dashboard/payroll/payroll.slice'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import { FeeAmount } from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { PAYROLL_BASE_PATH, formatMoney, sumMoney } from './payroll.helpers'

const PAGE_LIMIT = 12

/** Employee self service: the signed in user's own payslips only. */
export function PayrollMyPayslipsPage() {
  const dispatch = useDispatch()

  const { data, loading } = useSelector((store) => store.payroll.myPayslips)

  const [page, setPage] = useState(1)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    dispatch(getMyPayslipsAction({ page, limit: PAGE_LIMIT }))
  }, [dispatch, page])

  const rows = data?.rows ?? []
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)

  const download = async (payslipId: number, number: string) => {
    try {
      setDownloading(payslipId)
      const blob = await payrollServices.downloadMyPayslipPdfService(payslipId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `${number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Box>
      <FeePageHeader
        title="My payslips"
        subtitle="Your salary documents. The backend resolves the employee from your session, so you only ever see your own."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
      />

      <FeePanel
        title="Documents"
        subtitle={`${formatMoney(
          sumMoney(...rows.map((row) => row.net_amount))
        )} net across this page`}
        footer={
          totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          ) : null
        }
      >
        <Stack spacing={1.25}>
          {rows.map((row) => (
            <Stack
              key={row.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${colors.grey[200]}`,
              }}
            >
              <Box>
                <Typography fontSize={13.5} fontWeight={600}>
                  {row.period_key} · {row.payslip_number}
                </Typography>
                <Typography fontSize={12} color={colors.grey[600]}>
                  Gross {formatMoney(row.gross_amount)} · deductions{' '}
                  {formatMoney(row.total_deductions)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <FeeAmount value={row.net_amount} strong tone="success" />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download size={14} />}
                  disabled={downloading === row.id}
                  onClick={() => void download(row.id, row.payslip_number)}
                >
                  PDF
                </Button>
              </Stack>
            </Stack>
          ))}
          {!loading && !rows.length ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <FileText size={20} />
              <Typography fontSize={13} color={colors.grey[600]}>
                No payslip published for you yet.
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </FeePanel>
    </Box>
  )
}
