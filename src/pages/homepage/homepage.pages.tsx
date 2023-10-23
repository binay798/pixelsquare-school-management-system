import { Typography } from '@mui/material'
import { TooltipBtn } from '@src/components/button/button.component'
import { useToast } from '@src/components/toast/toast.hooks'

export function Homepage() {
  const toast = useToast()

  return (
    <div>
      <Typography>Homepage</Typography>

      <div style={{ padding: 10 }}>
        <TooltipBtn
          tooltipTitle="Toast"
          onClick={() => toast.success('Toast successfully opened.')}
        >
          Open toast
        </TooltipBtn>
      </div>
    </div>
  )
}
