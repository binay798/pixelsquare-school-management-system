import { Box, Stack } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { IoAddOutline } from 'react-icons/io5'
import { AddChapterModal } from '../addChapterModal/addChapterModal.component'
import { useCallback, useEffect, useState } from 'react'
import { ViewChapterDrawer } from '../viewChapterDrawer/viewChapterDrawer.component'
import { usePage } from '@src/helpers/getPageParams.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteChapterAction,
  getChapterListAction,
} from '@src/store/redux/dashboard/academics/subjects/subjects.slice'
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
  const [selectedChapter, setSelectedChapter] =
    useState<Academics.IChapter | null>(null)
  const [chapterToEdit, setChapterToEdit] = useState<Academics.IChapter | null>(
    null
  )
  const dispatch = useDispatch()
  const { data: chapterList, loading: chapterListLoading } = useSelector(
    (store) => store.subjects.chapterList
  )
  const { loading: deleteChapterLoading } = useSelector(
    (store) => store.subjects.deleteChapter
  )
  const { data: selectedSubject } = useSelector(
    (store) => store.subjects.selectedSubject
  )

  const viewChapterModal = (val: boolean) => {
    setOpenDrawer(val)
  }

  const openEditChapterModal = (chapter: Academics.IChapter | null) => {
    setChapterToEdit(chapter)
    setOpenDrawer(false)
    setOpenAddChapterModal(true)
  }

  useEffect(() => {
    const classIdVal = LOCAL_STORAGE.getItem(LOCAL_STORAGE_STATE.classId)
    if (!isEmpty(classIdVal)) {
      setClassId(Number(classIdVal))
    }
  }, [])

  const fetchChapterList = useCallback(() => {
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
  }, [dispatch, classId, subjectId, page, limit, search])

  useEffect(() => {
    fetchChapterList()
  }, [fetchChapterList])

  const remappedChapterList = useCallback(() => {
    return chapterList?.rows?.map((el) => el.chapter_details)
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
        actions={{
          onView: (item) => {
            setSelectedChapter(item)
            viewChapterModal(true)
          },
          onEdit: (item) => openEditChapterModal(item),
          onDelete: (item, onClose) => {
            if (!subjectId || !classId) return

            dispatch(
              deleteChapterAction({
                classId,
                subjectId: Number(subjectId),
                chapterId: item.id,
                onSuccess: () => {
                  onClose?.()
                  fetchChapterList()
                },
              })
            )
          },
        }}
        deleteConfirmLoader={deleteChapterLoading}
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
              onClick={() => {
                setChapterToEdit(null)
                setOpenAddChapterModal(true)
              }}
            >
              Add Chapter
            </ButtonComp>
            {/* <ButtonComp
              color="secondary"
              onClick={() => viewChapterModal(true)}
            >
              Open
            </ButtonComp> */}
          </Stack>
        }
      />

      {/* ADD / EDIT CHAPTER MODAL */}
      <AddChapterModal
        open={openAddChapterModal}
        onClose={() => {
          setOpenAddChapterModal(false)
          setChapterToEdit(null)
        }}
        details={chapterToEdit}
        subjectName={selectedSubject?.subject_details?.name}
        onSuccess={fetchChapterList}
      />

      {/* CHAPTER DETAIL DRAWER */}
      <ViewChapterDrawer
        open={openDrawer}
        toggle={viewChapterModal}
        chapter={selectedChapter}
        subjectName={selectedSubject?.subject_details?.name}
        onEdit={openEditChapterModal}
      />
    </Box>
  )
}
