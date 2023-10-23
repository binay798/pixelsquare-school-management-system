import { Typography } from '@mui/material'
import { TooltipBtn } from '@src/components/button/button.component'
import { useState } from 'react'

export function Homepage() {
  const [load, setLoad] = useState(false)

  return (
    <div>
      <Typography>Homepage</Typography>

      <div style={{ padding: 10 }}>
        <TooltipBtn
          variant="contained"
          tooltipTitle="open modal"
          loading={load}
          onClick={() => setLoad((prev) => !prev)}
        >
          Open modal se
        </TooltipBtn>
      </div>
    </div>
  )
}
