import { Box, Stack } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { IoAddOutline } from 'react-icons/io5'
import { AddChapterModal } from '../addChapterModal/addChapterModal.component'
import { useState } from 'react'
import { ViewChapterDrawer } from '../viewChapterDrawer/viewChapterDrawer.component'

export function ChapterList() {
  const [openAddChapterModal, setOpenAddChapterModal] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)

  const toggleDrawer = (val: boolean) => {
    setOpenDrawer(val)
  }

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
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <ButtonComp
              sx={{ textWrap: 'nowrap' }}
              startIcon={<IoAddOutline />}
              onClick={() => setOpenAddChapterModal(true)}
            >
              Add Chapter
            </ButtonComp>
            <ButtonComp color="secondary" onClick={() => toggleDrawer(true)}>
              Open
            </ButtonComp>
          </Stack>
        }
      />

      {/* ADD CHAPTER MODAL */}
      <AddChapterModal
        open={openAddChapterModal}
        onClose={() => setOpenAddChapterModal(false)}
      />

      {/* CHAPTER DETAIL DRAWER */}
      <ViewChapterDrawer open={openDrawer} toggle={toggleDrawer} />
    </Box>
  )
}
