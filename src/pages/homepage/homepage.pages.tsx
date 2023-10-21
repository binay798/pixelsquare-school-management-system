import SpringModal from '@src/components/modal/modal.component'
import { useState } from 'react'

export function Homepage() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      Homepage
      <button onClick={() => setOpen(true)}>Open</button>
      <SpringModal
        open={open}
        close={() => {
          setOpen(false)
        }}
      >
        Hello ther
      </SpringModal>
    </div>
  )
}
