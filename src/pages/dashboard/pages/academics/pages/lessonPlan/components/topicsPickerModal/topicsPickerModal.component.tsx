import {
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Search, BookOpen } from 'lucide-react'
import SpringModal from '@src/components/modal/modal.component'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  loadChapterOptions,
  loadTopicOptions,
  SelectOption,
} from '../../lessonPlan.helpers'

interface Props {
  open: boolean
  onClose: () => void
  classId?: number
  subjectId?: number
  selectedTopicIds: number[]
  loading?: boolean
  onSubmit: (
    topicIds: number[],
    selectedTopics: { id: number; name: string }[]
  ) => void
}

interface IChapterWithTopics {
  id: number
  label: string
  topics: SelectOption[]
}

export function TopicsPickerModal({
  open,
  onClose,
  classId,
  subjectId,
  selectedTopicIds,
  loading = false,
  onSubmit,
}: Props) {
  const [chapters, setChapters] = useState<IChapterWithTopics[]>([])
  const [fetching, setFetching] = useState(false)
  const [selected, setSelected] = useState<number[]>(selectedTopicIds)
  const [expanded, setExpanded] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open && !wasOpen.current) {
      setSelected(selectedTopicIds)
      setSearch('')
    }
    wasOpen.current = open
  }, [open, selectedTopicIds])

  useEffect(() => {
    if (!open || !classId || !subjectId) {
      return
    }
    let isMounted = true

    const load = async () => {
      setFetching(true)
      try {
        const chapterOptions = await loadChapterOptions(classId, subjectId)
        const withTopics = await Promise.all(
          chapterOptions.map(async (chapter) => ({
            id: chapter.value,
            label: chapter.label,
            topics: await loadTopicOptions(classId, subjectId, chapter.value),
          }))
        )
        if (isMounted) {
          setChapters(withTopics)
          setExpanded(withTopics.slice(0, 2).map((chapter) => chapter.id))
        }
      } catch {
        if (isMounted) {
          setChapters([])
        }
      } finally {
        if (isMounted) {
          setFetching(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [open, classId, subjectId])

  const visibleChapters = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return chapters
    }

    return chapters
      .map((chapter) => ({
        ...chapter,
        topics: chapter.topics.filter((topic) =>
          topic.label.toLowerCase().includes(term)
        ),
      }))
      .filter(
        (chapter) =>
          chapter.topics.length > 0 ||
          chapter.label.toLowerCase().includes(term)
      )
  }, [chapters, search])

  const toggleTopic = (topicId: number) => {
    setSelected((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    )
  }

  const toggleChapter = (chapter: IChapterWithTopics) => {
    const chapterTopicIds = chapter.topics.map((topic) => topic.value)
    const allSelected = chapterTopicIds.every((id) => selected.includes(id))

    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !chapterTopicIds.includes(id))
        : Array.from(new Set([...prev, ...chapterTopicIds]))
    )
  }

  const toggleExpanded = (chapterId: number) => {
    setExpanded((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  return (
    <SpringModal open={open} close={onClose} size="md">
      <Box sx={{ width: { xs: '100%', md: 620 }, minHeight: 360 }}>
        <Stack spacing={0.5} mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: colors.blue[50],
                color: colors.blue[600],
              }}
            >
              <BookOpen size={17} />
            </Box>
            <Typography fontSize={17} fontWeight={700} color={colors.grey[900]}>
              Topics covered
            </Typography>
          </Stack>
          <Typography fontSize={13} color={colors.grey[600]}>
            Pick the syllabus topics this lesson covers. Only topics of the
            selected subject can be attached.
          </Typography>
        </Stack>

        <InputField
          placeholder="Search topics or chapters"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <Search size={16} color={colors.grey[500]} />
            </InputAdornment>
          }
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            border: `1px solid ${colors.grey[200]}`,
            borderRadius: 2,
            maxHeight: 380,
            overflowY: 'auto',
          }}
        >
          {fetching ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              py={6}
              spacing={1}
            >
              <CircularProgress size={22} />
              <Typography fontSize={12} color={colors.grey[500]}>
                Loading syllabus topics...
              </Typography>
            </Stack>
          ) : visibleChapters.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              py={6}
              spacing={0.5}
            >
              <Typography
                fontSize={14}
                fontWeight={600}
                color={colors.grey[700]}
              >
                No topics found
              </Typography>
              <Typography fontSize={12} color={colors.grey[500]}>
                Add chapters and topics to this subject first.
              </Typography>
            </Stack>
          ) : (
            visibleChapters.map((chapter, index) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                isLast={index === visibleChapters.length - 1}
                expanded={expanded.includes(chapter.id)}
                selected={selected}
                onToggleExpanded={() => toggleExpanded(chapter.id)}
                onToggleChapter={() => toggleChapter(chapter)}
                onToggleTopic={toggleTopic}
              />
            ))
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography fontSize={13} color={colors.grey[600]}>
            <Box component="span" fontWeight={700} color={colors.blue[600]}>
              {selected.length}
            </Box>{' '}
            topic{selected.length === 1 ? '' : 's'} selected
          </Typography>
          <Stack direction="row" spacing={1}>
            <ButtonComp variant="outlined" size="medium" onClick={onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp
              size="medium"
              loading={loading}
              onClick={() => {
                const selectedTopics = chapters
                  .flatMap((chapter) => chapter.topics)
                  .filter((topic) => selected.includes(topic.value))
                  .map((topic) => ({ id: topic.value, name: topic.label }))
                onSubmit(selected, selectedTopics)
              }}
            >
              Save topics
            </ButtonComp>
          </Stack>
        </Stack>
      </Box>
    </SpringModal>
  )
}

interface IChapterRowProps {
  chapter: IChapterWithTopics
  isLast: boolean
  expanded: boolean
  selected: number[]
  onToggleExpanded: () => void
  onToggleChapter: () => void
  onToggleTopic: (topicId: number) => void
}

function ChapterRow({
  chapter,
  isLast,
  expanded,
  selected,
  onToggleExpanded,
  onToggleChapter,
  onToggleTopic,
}: IChapterRowProps) {
  const chapterTopicIds = chapter.topics.map((topic) => topic.value)
  const selectedCount = chapterTopicIds.filter((id) =>
    selected.includes(id)
  ).length

  return (
    <Box
      sx={{
        borderBottom: isLast ? 'none' : `1px solid ${colors.grey[100]}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: colors.grey[50] },
        }}
        onClick={onToggleExpanded}
      >
        {expanded ? (
          <ChevronDown size={16} color={colors.grey[600]} />
        ) : (
          <ChevronRight size={16} color={colors.grey[600]} />
        )}
        <Typography
          fontSize={13.5}
          fontWeight={600}
          color={colors.grey[800]}
          flex={1}
        >
          {chapter.label}
        </Typography>
        <Typography fontSize={12} color={colors.grey[500]}>
          {selectedCount}/{chapterTopicIds.length}
        </Typography>
        <ButtonComp
          size="small"
          variant="text"
          onClick={(event) => {
            event.stopPropagation()
            onToggleChapter()
          }}
          sx={{ fontSize: 11, minWidth: 'auto' }}
        >
          {selectedCount === chapterTopicIds.length ? 'Clear' : 'Select all'}
        </ButtonComp>
      </Stack>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack sx={{ pb: 1 }}>
          {chapter.topics.length === 0 ? (
            <Typography
              fontSize={12}
              color={colors.grey[500]}
              sx={{ pl: 5, py: 1 }}
            >
              No topics in this chapter yet.
            </Typography>
          ) : null}
          {chapter.topics.map((topic) => (
            <Stack
              key={topic.value}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                pl: 2,
                pr: 1.5,
                py: 0.25,
                cursor: 'pointer',
                '&:hover': { bgcolor: colors.grey[50] },
              }}
              onClick={() => onToggleTopic(topic.value)}
            >
              <Checkbox
                size="small"
                checked={selected.includes(topic.value)}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggleTopic(topic.value)}
                sx={{ p: 0.5 }}
              />
              <Typography fontSize={13} color={colors.grey[700]}>
                {topic.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Box>
  )
}
