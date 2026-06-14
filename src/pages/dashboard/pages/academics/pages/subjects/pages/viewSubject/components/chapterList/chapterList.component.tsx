import { Box } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { IoAddOutline } from 'react-icons/io5'
import { AddChapterModal } from '../addChapterModal/addChapterModal.component'
import { useState } from 'react'

export function ChapterList() {
  const [openAddChapterModal, setOpenAddChapterModal] = useState(false)

  return (
    <Box>
      <TableComp
        columns={[
          { field: 'No', name: 'No.' },
          { field: 'chapter_name', name: 'CHAPTER NAME' },
          { field: 'chapter_name', name: 'hours' },
          { field: 'chapter_name', name: 'status' },
          { field: 'chapter_name', name: 'created date' },
        ]}
        data={[]}
        actions={{ onDelete: () => {} }}
        search={() => {}}
        headerEl={
          <ButtonComp
            sx={{ textWrap: 'nowrap' }}
            startIcon={<IoAddOutline />}
            onClick={() => setOpenAddChapterModal(true)}
          >
            Add Chapter
          </ButtonComp>
        }
      />

      {/* ADD CHAPTER MODAL */}
      <AddChapterModal
        open={openAddChapterModal}
        onClose={() => setOpenAddChapterModal(false)}
      />
    </Box>
  )
}
