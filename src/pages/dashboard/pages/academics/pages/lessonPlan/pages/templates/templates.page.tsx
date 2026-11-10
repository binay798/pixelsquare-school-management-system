import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LayoutTemplate,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { TinyMceViewer } from '@src/components/tinyMce/tinyMceViewer.component'
import { colors } from '@src/helpers/colors.helpers'
import { ROLE } from '@src/constants/users.constants'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createLessonPlanTemplateAction,
  deleteLessonPlanTemplateAction,
  getLessonPlanTemplateListAction,
  setDefaultLessonPlanTemplateAction,
  updateLessonPlanTemplateAction,
} from '@src/store/redux/dashboard/academics/lessonPlans/lessonPlans.slice'
import { TemplateFormModal } from '../../components/templateFormModal/templateFormModal.component'

const BASE_PATH = '/dashboard/academics/lesson-plan'

export function LessonPlanTemplatesPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: auth } = useSelector((store) => store.auth.user)
  const { data: templateList, loading } = useSelector(
    (store) => store.lessonPlans.templateList
  )
  const { loading: templateLoading } = useSelector(
    (store) => store.lessonPlans.templateMutation
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<LessonPlan.ITemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LessonPlan.ITemplate | null>(
    null
  )

  const userRoles = auth?.userRoles ?? []
  const isAdmin = useMemo(
    () => userRoles.includes(ROLE.admin) || userRoles.includes(ROLE.superadmin),
    [userRoles]
  )

  useEffect(() => {
    dispatch(getLessonPlanTemplateListAction())
  }, [dispatch])

  const refresh = () => dispatch(getLessonPlanTemplateListAction())

  if (!isAdmin) {
    return (
      <Box
        sx={{
          maxWidth: 480,
          mx: 'auto',
          mt: 6,
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.grey[200]}`,
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        <Typography fontSize={15.5} fontWeight={700} color={colors.grey[900]}>
          Templates are managed by the school administration
        </Typography>
        <Typography fontSize={12.5} color={colors.grey[600]} mt={0.5} mb={2.5}>
          Ask your coordinator to configure the lesson plan templates of the
          school.
        </Typography>
        <ButtonComp
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(BASE_PATH)}
        >
          Back to lesson plans
        </ButtonComp>
      </Box>
    )
  }

  const templates = templateList ?? []

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(BASE_PATH)}
            sx={{ minWidth: 36, px: 1 }}
          >
            <ArrowLeft size={16} />
          </ButtonComp>
          <Box>
            <Typography variant="h6" fontWeight={700} color={colors.grey[900]}>
              Lesson plan templates
            </Typography>
            <Typography fontSize={12.5} color={colors.grey[600]} mt={0.25}>
              Decide the fields teachers have to fill for every lesson plan of
              the school.
            </Typography>
          </Box>
        </Stack>
        <ButtonComp
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingTemplate(null)
            setFormOpen(true)
          }}
        >
          New template
        </ButtonComp>
      </Stack>

      {loading && templates.length === 0 ? (
        <Stack alignItems="center" py={8} spacing={1.5}>
          <CircularProgress size={24} />
          <Typography fontSize={12.5} color={colors.grey[500]}>
            Loading templates...
          </Typography>
        </Stack>
      ) : templates.length === 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: `1px dashed ${colors.grey[300]}`,
            bgcolor: '#fff',
            py: 7,
            textAlign: 'center',
          }}
        >
          <Stack direction={'row'} justifyContent={'center'}>
            <LayoutTemplate size={36} color={colors.grey[400]} />
          </Stack>
          <Typography
            fontSize={14.5}
            fontWeight={600}
            color={colors.grey[800]}
            mt={1}
          >
            No templates yet
          </Typography>
          <Typography fontSize={12.5} color={colors.grey[500]} mt={0.5} mb={2}>
            Create your first template so teachers know exactly what to prepare.
          </Typography>
          <ButtonComp
            size="small"
            startIcon={<Plus size={15} />}
            onClick={() => {
              setEditingTemplate(null)
              setFormOpen(true)
            }}
          >
            New template
          </ButtonComp>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              loading={templateLoading}
              onEdit={() => {
                setEditingTemplate(template)
                setFormOpen(true)
              }}
              onDelete={() => setDeleteTarget(template)}
              onSetDefault={() =>
                dispatch(
                  setDefaultLessonPlanTemplateAction({
                    templateId: template.id,
                    onSuccess: refresh,
                  })
                )
              }
            />
          ))}
        </Box>
      )}

      <TemplateFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        template={editingTemplate}
        loading={templateLoading}
        onSubmit={(body) => {
          if (editingTemplate) {
            dispatch(
              updateLessonPlanTemplateAction({
                templateId: editingTemplate.id,
                body,
                onSuccess: () => {
                  setFormOpen(false)
                  refresh()
                },
              })
            )

            return
          }
          dispatch(
            createLessonPlanTemplateAction({
              body,
              onSuccess: () => {
                setFormOpen(false)
                refresh()
              },
            })
          )
        }}
      />

      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirmationClick={() => {
          if (!deleteTarget) {
            return
          }
          dispatch(
            deleteLessonPlanTemplateAction({
              templateId: deleteTarget.id,
              onSuccess: () => {
                setDeleteTarget(null)
                refresh()
              },
            })
          )
        }}
        confirmLoader={templateLoading}
        confirmText="Delete"
        heading="Delete this template?"
      >
        <Typography fontSize={13} color={colors.grey[600]}>
          Templates already used by lesson plans cannot be deleted — deactivate
          them instead.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}

function TemplateCard({
  template,
  loading,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  template: LessonPlan.ITemplate
  loading: boolean
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${
          template.is_default ? colors.blue[300] : colors.grey[200]
        }`,
        bgcolor: '#fff',
        p: 2.25,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: template.is_default
          ? '0 16px 32px -26px rgba(36,99,235,0.55)'
          : '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            gap={0.5}
          >
            <Typography fontSize={14} fontWeight={700} color={colors.grey[900]}>
              {template.name}
            </Typography>
            {template.is_default ? (
              <Stack
                direction="row"
                spacing={0.4}
                alignItems="center"
                sx={{
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 999,
                  bgcolor: colors.blue[50],
                  color: colors.blue[700],
                }}
              >
                <Star size={10} />
                <Typography fontSize={10.5} fontWeight={700}>
                  Default
                </Typography>
              </Stack>
            ) : null}
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 999,
                bgcolor: template.is_active
                  ? colors.green[50]
                  : colors.grey[100],
                color: template.is_active
                  ? colors.green[700]
                  : colors.grey[500],
              }}
            >
              <Typography fontSize={10.5} fontWeight={700}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
          </Stack>
          <Typography fontSize={11.5} color={colors.grey[500]} mt={0.5}>
            {template.description || 'No description provided.'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.25}>
          <Box
            component="button"
            onClick={onEdit}
            sx={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: colors.grey[500],
              display: 'flex',
              '&:hover': { color: colors.blue[600] },
            }}
          >
            <Pencil size={15} />
          </Box>
          <Box
            component="button"
            onClick={onDelete}
            sx={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: colors.grey[500],
              display: 'flex',
              '&:hover': { color: colors.red[400] },
            }}
          >
            <Trash2 size={15} />
          </Box>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75} mt={1.5}>
        {(template.fields ?? []).length === 0 ? (
          <Typography fontSize={11.5} color={colors.grey[400]}>
            No fields configured.
          </Typography>
        ) : (
          (template.fields ?? []).map((field) => (
            <Box
              key={field.key}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: colors.grey[100],
              }}
            >
              <Typography fontSize={11} color={colors.grey[700]}>
                {field.label}
                {field.required ? (
                  <Box component="span" sx={{ color: colors.red[400] }}>
                    {' '}
                    *
                  </Box>
                ) : null}
              </Typography>
            </Box>
          ))
        )}
      </Stack>

      <Box mt={1.5} flex={1}>
        {template.default_objectives ? (
          <Box>
            <Typography
              fontSize={11.5}
              fontWeight={700}
              color={colors.grey[600]}
              mb={0.25}
            >
              Objectives:
            </Typography>
            <TinyMceViewer content={template.default_objectives} dense />
          </Box>
        ) : null}
      </Box>

      {!template.is_default ? (
        <ButtonComp
          size="small"
          variant="outlined"
          startIcon={<Star size={14} />}
          disabled={!template.is_active}
          loading={loading}
          onClick={onSetDefault}
          sx={{ mt: 2, alignSelf: 'flex-start' }}
        >
          Set as default
        </ButtonComp>
      ) : null}
    </Box>
  )
}
