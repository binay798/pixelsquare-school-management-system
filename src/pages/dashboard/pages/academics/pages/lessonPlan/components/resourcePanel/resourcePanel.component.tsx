import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Paperclip,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { colors } from '@src/helpers/colors.helpers'
import { getResourceKind } from '../../lessonPlan.helpers'

interface Props {
  resources: LessonPlan.IResource[]
  locked?: boolean
  loading?: boolean
  onUpload: (files: File[]) => void
  onAttachLink: (data: { url: string; label?: string }) => void
  onDelete: (resourceId: number) => void
}

const ACCEPTED_TYPES =
  'image/png,image/jpeg,image/webp,application/pdf,.png,.jpg,.jpeg,.webp,.pdf'

export function ResourcePanel({
  resources,
  locked = false,
  loading = false,
  onUpload,
  onAttachLink,
  onDelete,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    onUpload(Array.from(files))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAttachLink = () => {
    if (!linkUrl.trim()) {
      return
    }
    onAttachLink({
      url: linkUrl.trim(),
      label: linkLabel.trim() || undefined,
    })
    setLinkUrl('')
    setLinkLabel('')
    setShowLinkForm(false)
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Paperclip size={16} color={colors.blue[600]} />
          <Typography fontSize={15} fontWeight={700} color={colors.grey[900]}>
            Resources
          </Typography>
          <Typography fontSize={12} color={colors.grey[500]}>
            {resources.length} attached
          </Typography>
        </Stack>
        {!locked ? (
          <Stack direction="row" spacing={1}>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Link2 size={14} />}
              onClick={() => setShowLinkForm((prev) => !prev)}
            >
              Attach link
            </ButtonComp>
            <ButtonComp
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => fileInputRef.current?.click()}
              loading={loading}
            >
              Upload file
            </ButtonComp>
          </Stack>
        ) : (
          <Typography fontSize={11} color={colors.grey[500]}>
            Locked while the plan is approved/completed
          </Typography>
        )}
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_TYPES}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {showLinkForm && !locked ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'flex-end' }}
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: 2,
            border: `1px dashed ${colors.blue[200]}`,
            bgcolor: colors.blue[50],
          }}
        >
          <Box flex={2}>
            <InputField
              placeholder="https://youtube.com/watch?v=..."
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </Box>
          <Box flex={1.2}>
            <InputField
              placeholder="Label (optional)"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
            />
          </Box>
          <ButtonComp
            size="small"
            onClick={handleAttachLink}
            disabled={!linkUrl.trim()}
            sx={{ height: 36 }}
          >
            Attach
          </ButtonComp>
        </Stack>
      ) : null}

      {!locked ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            handleFiles(event.dataTransfer.files)
          }}
          sx={{
            border: `1.5px dashed ${colors.grey[300]}`,
            borderRadius: 2,
            bgcolor: colors.grey[50],
            px: 2,
            py: 2,
            mb: 1.5,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: colors.blue[400],
              bgcolor: colors.blue[50],
            },
          }}
        >
          <Stack alignItems="center" spacing={0.5}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <UploadCloud size={24} color={colors.blue[500]} />
            )}
            <Typography fontSize={13} fontWeight={600} color={colors.grey[700]}>
              Drag &amp; drop or click to upload
            </Typography>
            <Typography fontSize={11} color={colors.grey[500]}>
              PDF, JPG, PNG or WEBP — up to 10 MB each
            </Typography>
          </Stack>
        </Box>
      ) : null}

      <ResourceList resources={resources} locked={locked} onDelete={onDelete} />
    </Box>
  )
}

interface IResourceListProps {
  resources: LessonPlan.IResource[]
  locked: boolean
  onDelete: (resourceId: number) => void
}

function ResourceList({ resources, locked, onDelete }: IResourceListProps) {
  if (resources.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${colors.grey[200]}`,
          px: 2,
          py: 2.5,
          textAlign: 'center',
        }}
      >
        <Typography fontSize={12.5} color={colors.grey[500]}>
          No worksheets, slides or links attached to this plan yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={1}>
      {resources.map((resource) => {
        const kind = getResourceKind(resource)
        const href = resource.external_url
          ? resource.external_url
          : resource.path
          ? getImageUrl(resource.path)
          : undefined
        const isImage = kind === 'image'

        return (
          <Stack
            key={resource.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              border: `1px solid ${colors.grey[200]}`,
              borderRadius: 2,
              px: 1.5,
              py: 1,
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: colors.blue[300] },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: isImage
                  ? colors.green[50]
                  : kind === 'pdf'
                  ? colors.red[50]
                  : kind === 'link'
                  ? colors.purple[50]
                  : colors.grey[100],
                color: isImage
                  ? colors.green[600]
                  : kind === 'pdf'
                  ? colors.red[500]
                  : kind === 'link'
                  ? colors.purple[500]
                  : colors.grey[600],
                flexShrink: 0,
              }}
            >
              {isImage ? (
                <ImageIcon size={16} />
              ) : kind === 'link' ? (
                <Link2 size={16} />
              ) : (
                <FileText size={16} />
              )}
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography
                fontSize={13}
                fontWeight={600}
                color={colors.grey[800]}
                noWrap
              >
                {resource.label ?? (resource.path ? 'Attachment' : 'Link')}
              </Typography>
              <Typography fontSize={11} color={colors.grey[500]} noWrap>
                {resource.external_url
                  ? resource.external_url
                  : resource.file_type === 'image'
                  ? 'Image'
                  : 'PDF document'}
              </Typography>
            </Box>
            {href ? (
              <Tooltip title="Open in new tab">
                <IconButton
                  size="small"
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} color={colors.grey[600]} />
                </IconButton>
              </Tooltip>
            ) : null}
            {!locked ? (
              <Tooltip title="Remove resource">
                <IconButton size="small" onClick={() => onDelete(resource.id)}>
                  <Trash2 size={15} color={colors.red[400]} />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        )
      })}
    </Stack>
  )
}
