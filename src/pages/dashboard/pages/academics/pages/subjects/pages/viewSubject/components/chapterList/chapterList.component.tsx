import { Box, Stack } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { IoAddOutline } from 'react-icons/io5'
import { AddChapterModal } from '../addChapterModal/addChapterModal.component'
import { useCallback, useEffect, useState } from 'react'
import { ViewChapterDrawer } from '../viewChapterDrawer/viewChapterDrawer.component'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getChapterListAction } from '@src/store/redux/dashboard/academics/subjects/subjects.slice'
import { useParams } from 'react-router-dom'
import {
  LOCAL_STORAGE,
  LOCAL_STORAGE_STATE,
} from '@src/constants/global.constants'
import { capitalize, isEmpty } from 'lodash'
import moment from 'moment'
import { CustomChip } from '@src/components/chip/chip.component'

export function ChapterList() {
  const { subjectId } = useParams()
  const { page, limit } = usePage()
  const [classId, setClassId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [openAddChapterModal, setOpenAddChapterModal] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const dispatch = useDispatch()
  const { data: chapterList, loading: chapterListLoading } = useSelector(
    (store) => store.subjects.chapterList
  )

  const toggleDrawer = (val: boolean) => {
    setOpenDrawer(val)
  }

  useEffect(() => {
    const classIdVal = LOCAL_STORAGE.getItem(LOCAL_STORAGE_STATE.classId)
    if (!isEmpty(classIdVal)) {
      setClassId(Number(classIdVal))
    }
  }, [])

  useEffect(() => {
    if (!subjectId || !classId) return

    dispatch(
      getChapterListAction({
        classId,
        subjectId: Number(subjectId),
        page,
        limit,
        search,
      })
    )
  }, [classId, subjectId, page, limit, search])

  const remappedChapterList = useCallback(() => {
    return chapterList?.rows?.map((el) => ({
      id: el.chapter_details.id,
      chapter_number: el.chapter_details.chapter_number,
      name: el.chapter_details.name,
      duration: el.chapter_details.duration,
      status: el.chapter_details.status,
      created_at: el.chapter_details.created_at,
    }))
  }, [chapterList])

  return (
    <Box>
      <TableComp
        columns={[
          { field: 'chapter_number', name: 'No.' },
          { field: 'name', name: 'CHAPTER NAME' },
          { field: 'duration', name: 'Hours' },
          {
            field: 'status',
            name: 'Status',
            render: (val) => (
              <CustomChip
                label={capitalize(String(val))}
                type={val === 'active' ? 'success' : 'error'}
              />
            ),
          },
          {
            field: 'created_at',
            name: 'Created Date',
            render: (val) => moment(val as string).format('DD MMM YYYY'),
          },
        ]}
        loading={chapterListLoading}
        data={remappedChapterList() ?? []}
        actions={{ onDelete: () => {} }}
        count={Number(chapterList?.total)}
        page={page}
        rowsPerPage={limit}
        showPagination={true}
        search={(txt) => setSearch(txt)}
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
