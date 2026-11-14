import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  feeServices,
  IAssignConcessionDto,
  IBulkAssignmentDto,
  ICreateAssignmentDto,
  ICreateFeeTemplateDto,
  ICreateFeeTypeDto,
  ICreateScholarshipDto,
  IDuplicateFeeTemplateDto,
  IFeeTypeFilters,
  ILateFeeRuleDto,
  IUpdateFeeTemplateDto,
  IUpdateFeeTypeDto,
  IUpdateScholarshipDto,
  IAssignmentFilters,
  IConcessionFilters,
  IScholarshipFilters,
  ITemplateFilters,
} from './fee.service'

interface InitialState {
  feeTypes: { data: Fee.IList<Fee.IFeeType> | null; loading: boolean }
  feeTypeMutation: { loading: boolean }
  templates: { data: Fee.IList<Fee.IFeeTemplate> | null; loading: boolean }
  templateDetail: { data: Fee.IFeeTemplateDetail | null; loading: boolean }
  templateMutation: { loading: boolean }
  assignments: { data: Fee.IList<Fee.IAssignment> | null; loading: boolean }
  assignmentMutation: { loading: boolean }
  bulkAssignment: {
    loading: boolean
    result: { students: number; created: number; skipped: number } | null
  }
  scholarships: { data: Fee.IList<Fee.IScholarship> | null; loading: boolean }
  scholarshipMutation: { loading: boolean }
  concessions: { data: Fee.IList<Fee.IConcession> | null; loading: boolean }
  concessionMutation: { loading: boolean }
  lateFeeRules: { data: Fee.ILateFeeRule[] | null; loading: boolean }
  lateFeeRuleMutation: { loading: boolean }
  lateFeeAssessment: {
    loading: boolean
    result: Fee.ILateFeeAssessment | null
  }
}

const initialState: InitialState = {
  feeTypes: { data: null, loading: false },
  feeTypeMutation: { loading: false },
  templates: { data: null, loading: false },
  templateDetail: { data: null, loading: false },
  templateMutation: { loading: false },
  assignments: { data: null, loading: false },
  assignmentMutation: { loading: false },
  bulkAssignment: { loading: false, result: null },
  scholarships: { data: null, loading: false },
  scholarshipMutation: { loading: false },
  concessions: { data: null, loading: false },
  concessionMutation: { loading: false },
  lateFeeRules: { data: null, loading: false },
  lateFeeRuleMutation: { loading: false },
  lateFeeAssessment: { loading: false, result: null },
}

type TListRequest<F> = { filters?: F; page?: number; limit?: number }

/* ------------------------------ fee types ------------------------------ */

export const getFeeTypesAction = createAsyncThunk(
  'feeConfig/getFeeTypes',
  catchAsync(
    async (data: TListRequest<IFeeTypeFilters>) =>
      await feeServices.listFeeTypesService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createFeeTypeAction = createAsyncThunk(
  'feeConfig/createFeeType',
  catchAsync(
    async (data: { payload: ICreateFeeTypeDto; onSuccess?: () => void }) => {
      const res = await feeServices.createFeeTypeService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee type created'
  )
)

export const updateFeeTypeAction = createAsyncThunk(
  'feeConfig/updateFeeType',
  catchAsync(
    async (data: {
      feeTypeId: number
      payload: IUpdateFeeTypeDto
      onSuccess?: () => void
    }) => {
      const res = await feeServices.updateFeeTypeService(
        data.feeTypeId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee type updated'
  )
)

export const deactivateFeeTypeAction = createAsyncThunk(
  'feeConfig/deactivateFeeType',
  catchAsync(
    async (data: { feeTypeId: number; onSuccess?: () => void }) => {
      const res = await feeServices.deactivateFeeTypeService(data.feeTypeId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee type deactivated'
  )
)

/* ----------------------------- fee templates ---------------------------- */

export const getFeeTemplatesAction = createAsyncThunk(
  'feeConfig/getFeeTemplates',
  catchAsync(
    async (data: TListRequest<ITemplateFilters>) =>
      await feeServices.listFeeTemplatesService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const getFeeTemplateAction = createAsyncThunk(
  'feeConfig/getFeeTemplate',
  catchAsync(
    async (data: { templateId: number }) =>
      await feeServices.getFeeTemplateService(data.templateId)
  )
)

export const createFeeTemplateAction = createAsyncThunk(
  'feeConfig/createFeeTemplate',
  catchAsync(
    async (data: {
      payload: ICreateFeeTemplateDto
      onSuccess?: (template: Fee.IFeeTemplateDetail) => void
    }) => {
      const res = await feeServices.createFeeTemplateService(data.payload)
      data.onSuccess?.(res)

      return res
    },
    true,
    false,
    'Fee template created'
  )
)

export const updateFeeTemplateAction = createAsyncThunk(
  'feeConfig/updateFeeTemplate',
  catchAsync(
    async (data: {
      templateId: number
      payload: IUpdateFeeTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await feeServices.updateFeeTemplateService(
        data.templateId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee template updated'
  )
)

export const duplicateFeeTemplateAction = createAsyncThunk(
  'feeConfig/duplicateFeeTemplate',
  catchAsync(
    async (data: {
      templateId: number
      payload: IDuplicateFeeTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await feeServices.duplicateFeeTemplateService(
        data.templateId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee template duplicated'
  )
)

export const deactivateFeeTemplateAction = createAsyncThunk(
  'feeConfig/deactivateFeeTemplate',
  catchAsync(
    async (data: { templateId: number; onSuccess?: () => void }) => {
      const res = await feeServices.deactivateFeeTemplateService(
        data.templateId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee template deactivated'
  )
)

/* ---------------------------- fee assignments --------------------------- */

export const getAssignmentsAction = createAsyncThunk(
  'feeConfig/getAssignments',
  catchAsync(
    async (data: TListRequest<IAssignmentFilters>) =>
      await feeServices.listAssignmentsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createAssignmentAction = createAsyncThunk(
  'feeConfig/createAssignment',
  catchAsync(
    async (data: { payload: ICreateAssignmentDto; onSuccess?: () => void }) => {
      const res = await feeServices.createAssignmentService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Fee template assigned'
  )
)

export const bulkAssignAction = createAsyncThunk(
  'feeConfig/bulkAssign',
  catchAsync(
    async (data: { payload: IBulkAssignmentDto; onSuccess?: () => void }) => {
      const res = await feeServices.bulkAssignTemplateService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Bulk assignment completed'
  )
)

export const cancelAssignmentAction = createAsyncThunk(
  'feeConfig/cancelAssignment',
  catchAsync(
    async (data: { assignmentId: number; onSuccess?: () => void }) => {
      const res = await feeServices.cancelAssignmentService(data.assignmentId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Assignment cancelled'
  )
)

/* ------------------------ scholarships / discounts ---------------------- */

export const getScholarshipsAction = createAsyncThunk(
  'feeConfig/getScholarships',
  catchAsync(
    async (data: TListRequest<IScholarshipFilters>) =>
      await feeServices.listScholarshipsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const createScholarshipAction = createAsyncThunk(
  'feeConfig/createScholarship',
  catchAsync(
    async (data: {
      payload: ICreateScholarshipDto
      onSuccess?: () => void
    }) => {
      const res = await feeServices.createScholarshipService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Scholarship created'
  )
)

export const updateScholarshipAction = createAsyncThunk(
  'feeConfig/updateScholarship',
  catchAsync(
    async (data: {
      scholarshipId: number
      payload: IUpdateScholarshipDto
      onSuccess?: () => void
    }) => {
      const res = await feeServices.updateScholarshipService(
        data.scholarshipId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Scholarship updated'
  )
)

/* ------------------------------ concessions ----------------------------- */

export const getConcessionsAction = createAsyncThunk(
  'feeConfig/getConcessions',
  catchAsync(
    async (data: TListRequest<IConcessionFilters>) =>
      await feeServices.listConcessionsService(
        data?.filters,
        data?.page,
        data?.limit
      )
  )
)

export const assignConcessionAction = createAsyncThunk(
  'feeConfig/assignConcession',
  catchAsync(
    async (data: { payload: IAssignConcessionDto; onSuccess?: () => void }) => {
      const res = await feeServices.assignConcessionService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Concession assigned'
  )
)

export const decideConcessionAction = createAsyncThunk(
  'feeConfig/decideConcession',
  catchAsync(
    async (data: {
      concessionId: number
      decision: Fee.ConcessionApprovalStatus
      remarks?: string
      onSuccess?: () => void
    }) => {
      const res = await feeServices.decideConcessionService(data.concessionId, {
        decision: data.decision,
        remarks: data.remarks,
      })
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Concession updated'
  )
)

/* ------------------------------- late fees ------------------------------ */

export const getLateFeeRulesAction = createAsyncThunk(
  'feeConfig/getLateFeeRules',
  catchAsync(async () => await feeServices.listLateFeeRulesService())
)

export const createLateFeeRuleAction = createAsyncThunk(
  'feeConfig/createLateFeeRule',
  catchAsync(
    async (data: { payload: ILateFeeRuleDto; onSuccess?: () => void }) => {
      const res = await feeServices.createLateFeeRuleService(data.payload)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Late fee rule created'
  )
)

export const updateLateFeeRuleAction = createAsyncThunk(
  'feeConfig/updateLateFeeRule',
  catchAsync(
    async (data: {
      ruleId: number
      payload: Partial<ILateFeeRuleDto>
      onSuccess?: () => void
    }) => {
      const res = await feeServices.updateLateFeeRuleService(
        data.ruleId,
        data.payload
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Late fee rule updated'
  )
)

export const deactivateLateFeeRuleAction = createAsyncThunk(
  'feeConfig/deactivateLateFeeRule',
  catchAsync(
    async (data: { ruleId: number; onSuccess?: () => void }) => {
      const res = await feeServices.deactivateLateFeeRuleService(data.ruleId)
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Late fee rule deactivated'
  )
)

export const assessLateFeesAction = createAsyncThunk(
  'feeConfig/assessLateFees',
  catchAsync(
    async (data: {
      as_of_date?: string
      rule_id?: number
      dry_run?: boolean
      onSuccess?: (result: Fee.ILateFeeAssessment) => void
    }) => {
      const res = await feeServices.assessLateFeesService({
        as_of_date: data.as_of_date,
        rule_id: data.rule_id,
        dry_run: data.dry_run,
      })
      data.onSuccess?.(res)

      return res
    }
  )
)

const feeConfigSlice = createSlice({
  name: 'feeConfig',
  initialState,
  reducers: {
    resetTemplateDetail: (state) => {
      state.templateDetail.data = null
    },
    resetAssessment: (state) => {
      state.lateFeeAssessment.result = null
    },
    resetBulkAssignment: (state) => {
      state.bulkAssignment.result = null
    },
  },
  extraReducers: (builder) => {
    /* ------------------------------ fee types ------------------------------ */
    builder.addCase(getFeeTypesAction.pending, (state) => {
      state.feeTypes.loading = true
    })
    builder.addCase(getFeeTypesAction.fulfilled, (state, action) => {
      state.feeTypes.loading = false
      state.feeTypes.data = action.payload
    })
    builder.addCase(getFeeTypesAction.rejected, (state) => {
      state.feeTypes.loading = false
    })
    builder.addCase(createFeeTypeAction.pending, (state) => {
      state.feeTypeMutation.loading = true
    })
    builder.addCase(createFeeTypeAction.fulfilled, (state) => {
      state.feeTypeMutation.loading = false
    })
    builder.addCase(createFeeTypeAction.rejected, (state) => {
      state.feeTypeMutation.loading = false
    })
    builder.addCase(updateFeeTypeAction.pending, (state) => {
      state.feeTypeMutation.loading = true
    })
    builder.addCase(updateFeeTypeAction.fulfilled, (state) => {
      state.feeTypeMutation.loading = false
    })
    builder.addCase(updateFeeTypeAction.rejected, (state) => {
      state.feeTypeMutation.loading = false
    })
    builder.addCase(deactivateFeeTypeAction.pending, (state) => {
      state.feeTypeMutation.loading = true
    })
    builder.addCase(deactivateFeeTypeAction.fulfilled, (state) => {
      state.feeTypeMutation.loading = false
    })
    builder.addCase(deactivateFeeTypeAction.rejected, (state) => {
      state.feeTypeMutation.loading = false
    })

    /* ---------------------------- fee templates ---------------------------- */
    builder.addCase(getFeeTemplatesAction.pending, (state) => {
      state.templates.loading = true
    })
    builder.addCase(getFeeTemplatesAction.fulfilled, (state, action) => {
      state.templates.loading = false
      state.templates.data = action.payload
    })
    builder.addCase(getFeeTemplatesAction.rejected, (state) => {
      state.templates.loading = false
    })
    builder.addCase(getFeeTemplateAction.pending, (state) => {
      state.templateDetail.loading = true
    })
    builder.addCase(getFeeTemplateAction.fulfilled, (state, action) => {
      state.templateDetail.loading = false
      state.templateDetail.data = action.payload
    })
    builder.addCase(getFeeTemplateAction.rejected, (state) => {
      state.templateDetail.loading = false
    })
    builder.addCase(createFeeTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(createFeeTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(createFeeTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(updateFeeTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(updateFeeTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(updateFeeTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(duplicateFeeTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(duplicateFeeTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(duplicateFeeTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(deactivateFeeTemplateAction.pending, (state) => {
      state.templateMutation.loading = true
    })
    builder.addCase(deactivateFeeTemplateAction.fulfilled, (state) => {
      state.templateMutation.loading = false
    })
    builder.addCase(deactivateFeeTemplateAction.rejected, (state) => {
      state.templateMutation.loading = false
    })

    /* ---------------------------- fee assignments --------------------------- */
    builder.addCase(getAssignmentsAction.pending, (state) => {
      state.assignments.loading = true
    })
    builder.addCase(getAssignmentsAction.fulfilled, (state, action) => {
      state.assignments.loading = false
      state.assignments.data = action.payload
    })
    builder.addCase(getAssignmentsAction.rejected, (state) => {
      state.assignments.loading = false
    })
    builder.addCase(createAssignmentAction.pending, (state) => {
      state.assignmentMutation.loading = true
    })
    builder.addCase(createAssignmentAction.fulfilled, (state) => {
      state.assignmentMutation.loading = false
    })
    builder.addCase(createAssignmentAction.rejected, (state) => {
      state.assignmentMutation.loading = false
    })
    builder.addCase(cancelAssignmentAction.pending, (state) => {
      state.assignmentMutation.loading = true
    })
    builder.addCase(cancelAssignmentAction.fulfilled, (state) => {
      state.assignmentMutation.loading = false
    })
    builder.addCase(cancelAssignmentAction.rejected, (state) => {
      state.assignmentMutation.loading = false
    })
    builder.addCase(bulkAssignAction.pending, (state) => {
      state.bulkAssignment.loading = true
      state.bulkAssignment.result = null
    })
    builder.addCase(bulkAssignAction.fulfilled, (state, action) => {
      state.bulkAssignment.loading = false
      state.bulkAssignment.result = action.payload
    })
    builder.addCase(bulkAssignAction.rejected, (state) => {
      state.bulkAssignment.loading = false
    })

    /* -------------------------- scholarships / discounts -------------------- */
    builder.addCase(getScholarshipsAction.pending, (state) => {
      state.scholarships.loading = true
    })
    builder.addCase(getScholarshipsAction.fulfilled, (state, action) => {
      state.scholarships.loading = false
      state.scholarships.data = action.payload
    })
    builder.addCase(getScholarshipsAction.rejected, (state) => {
      state.scholarships.loading = false
    })
    builder.addCase(createScholarshipAction.pending, (state) => {
      state.scholarshipMutation.loading = true
    })
    builder.addCase(createScholarshipAction.fulfilled, (state) => {
      state.scholarshipMutation.loading = false
    })
    builder.addCase(createScholarshipAction.rejected, (state) => {
      state.scholarshipMutation.loading = false
    })
    builder.addCase(updateScholarshipAction.pending, (state) => {
      state.scholarshipMutation.loading = true
    })
    builder.addCase(updateScholarshipAction.fulfilled, (state) => {
      state.scholarshipMutation.loading = false
    })
    builder.addCase(updateScholarshipAction.rejected, (state) => {
      state.scholarshipMutation.loading = false
    })

    /* ------------------------------ concessions ----------------------------- */
    builder.addCase(getConcessionsAction.pending, (state) => {
      state.concessions.loading = true
    })
    builder.addCase(getConcessionsAction.fulfilled, (state, action) => {
      state.concessions.loading = false
      state.concessions.data = action.payload
    })
    builder.addCase(getConcessionsAction.rejected, (state) => {
      state.concessions.loading = false
    })
    builder.addCase(assignConcessionAction.pending, (state) => {
      state.concessionMutation.loading = true
    })
    builder.addCase(assignConcessionAction.fulfilled, (state) => {
      state.concessionMutation.loading = false
    })
    builder.addCase(assignConcessionAction.rejected, (state) => {
      state.concessionMutation.loading = false
    })
    builder.addCase(decideConcessionAction.pending, (state) => {
      state.concessionMutation.loading = true
    })
    builder.addCase(decideConcessionAction.fulfilled, (state) => {
      state.concessionMutation.loading = false
    })
    builder.addCase(decideConcessionAction.rejected, (state) => {
      state.concessionMutation.loading = false
    })

    /* ------------------------------- late fees ------------------------------ */
    builder.addCase(getLateFeeRulesAction.pending, (state) => {
      state.lateFeeRules.loading = true
    })
    builder.addCase(getLateFeeRulesAction.fulfilled, (state, action) => {
      state.lateFeeRules.loading = false
      state.lateFeeRules.data = action.payload.rows
    })
    builder.addCase(getLateFeeRulesAction.rejected, (state) => {
      state.lateFeeRules.loading = false
    })
    builder.addCase(createLateFeeRuleAction.pending, (state) => {
      state.lateFeeRuleMutation.loading = true
    })
    builder.addCase(createLateFeeRuleAction.fulfilled, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(createLateFeeRuleAction.rejected, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(updateLateFeeRuleAction.pending, (state) => {
      state.lateFeeRuleMutation.loading = true
    })
    builder.addCase(updateLateFeeRuleAction.fulfilled, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(updateLateFeeRuleAction.rejected, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(deactivateLateFeeRuleAction.pending, (state) => {
      state.lateFeeRuleMutation.loading = true
    })
    builder.addCase(deactivateLateFeeRuleAction.fulfilled, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(deactivateLateFeeRuleAction.rejected, (state) => {
      state.lateFeeRuleMutation.loading = false
    })
    builder.addCase(assessLateFeesAction.pending, (state) => {
      state.lateFeeAssessment.loading = true
    })
    builder.addCase(assessLateFeesAction.fulfilled, (state, action) => {
      state.lateFeeAssessment.loading = false
      state.lateFeeAssessment.result = action.payload
    })
    builder.addCase(assessLateFeesAction.rejected, (state) => {
      state.lateFeeAssessment.loading = false
    })
  },
})

export const { resetTemplateDetail, resetAssessment, resetBulkAssignment } =
  feeConfigSlice.actions
export default feeConfigSlice.reducer
