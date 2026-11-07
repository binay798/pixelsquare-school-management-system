import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { catchAsync } from '@src/helpers/catchAsync.helpers'
import {
  classRoutineServices,
  IClassRoutineFilters,
  TCreateClassRoutineDto,
  TCreateScheduleTemplateDto,
  TCreateTimeSlotDto,
  TCreateWorkingDayDto,
  TUpdateClassRoutineDto,
  TUpdateScheduleTemplateDto,
  TUpdateTimeSlotDto,
  TUpdateWorkingDayDto,
} from './classRoutines.service'

interface InitialState {
  routineList: {
    data: Academics.IClassRoutineList[] | null
    loading: boolean
  }
  myRoutineList: {
    data: Academics.IClassRoutineList[] | null
    loading: boolean
  }
  createRoutine: {
    loading: boolean
  }
  updateRoutine: {
    loading: boolean
  }
  deleteRoutine: {
    loading: boolean
  }
  timeSlotList: {
    data: Academics.ITimeSlotList[] | null
    loading: boolean
  }
  timeSlotMutation: {
    loading: boolean
  }
  workingDayList: {
    data: Academics.IWorkingDayList[] | null
    loading: boolean
  }
  workingDayMutation: {
    loading: boolean
  }
  scheduleTemplateList: {
    data: Academics.IScheduleTemplateList[] | null
    loading: boolean
  }
  scheduleTemplateMutation: {
    loading: boolean
  }
}

const initialState: InitialState = {
  routineList: {
    data: null,
    loading: false,
  },
  myRoutineList: {
    data: null,
    loading: false,
  },
  createRoutine: {
    loading: false,
  },
  updateRoutine: {
    loading: false,
  },
  deleteRoutine: {
    loading: false,
  },
  timeSlotList: {
    data: null,
    loading: false,
  },
  timeSlotMutation: {
    loading: false,
  },
  workingDayList: {
    data: null,
    loading: false,
  },
  workingDayMutation: {
    loading: false,
  },
  scheduleTemplateList: {
    data: null,
    loading: false,
  },
  scheduleTemplateMutation: {
    loading: false,
  },
}

// MARK: - CLASS ROUTINE
export const getClassRoutineListAction = createAsyncThunk(
  'classRoutine/getList',
  catchAsync(async (data: IClassRoutineFilters) => {
    const res = await classRoutineServices.getClassRoutineListService(data)

    return res.data
  })
)

export const getMyRoutineListAction = createAsyncThunk(
  'classRoutine/getMyList',
  catchAsync(async () => {
    const res = await classRoutineServices.getMyRoutineListService()

    return res.data
  })
)

export const createClassRoutineAction = createAsyncThunk(
  'classRoutine/create',
  catchAsync(
    async (data: {
      classId: number
      body: TCreateClassRoutineDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.createClassRoutineService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created class routine.'
  )
)

export const updateClassRoutineAction = createAsyncThunk(
  'classRoutine/update',
  catchAsync(
    async (data: {
      classId: number
      routineId: number
      body: TUpdateClassRoutineDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.updateClassRoutineService(
        data.classId,
        data.routineId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully updated class routine.'
  )
)

export const deleteClassRoutineAction = createAsyncThunk(
  'classRoutine/delete',
  catchAsync(
    async (data: {
      classId: number
      routineId: number
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.deleteClassRoutineService(
        data.classId,
        data.routineId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully deleted class routine.'
  )
)

// MARK: - TIME SLOT
export const getTimeSlotListAction = createAsyncThunk(
  'classRoutine/getTimeSlotList',
  catchAsync(async (data: { classId: number }) => {
    const res = await classRoutineServices.getTimeSlotListService(data.classId)

    return res.data
  })
)

export const createTimeSlotAction = createAsyncThunk(
  'classRoutine/createTimeSlot',
  catchAsync(
    async (data: {
      classId: number
      body: TCreateTimeSlotDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.createTimeSlotService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created time slot.'
  )
)

export const updateTimeSlotAction = createAsyncThunk(
  'classRoutine/updateTimeSlot',
  catchAsync(
    async (data: {
      classId: number
      timeSlotId: number
      body: TUpdateTimeSlotDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.updateTimeSlotService(
        data.classId,
        data.timeSlotId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully updated time slot.'
  )
)

export const deleteTimeSlotAction = createAsyncThunk(
  'classRoutine/deleteTimeSlot',
  catchAsync(
    async (data: {
      classId: number
      timeSlotId: number
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.deleteTimeSlotService(
        data.classId,
        data.timeSlotId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully deleted time slot.'
  )
)

// MARK: - WORKING DAY
export const getWorkingDayListAction = createAsyncThunk(
  'classRoutine/getWorkingDayList',
  catchAsync(async (data: { classId: number }) => {
    const res = await classRoutineServices.getWorkingDayListService(
      data.classId
    )

    return res.data
  })
)

export const createWorkingDayAction = createAsyncThunk(
  'classRoutine/createWorkingDay',
  catchAsync(
    async (data: {
      classId: number
      body: TCreateWorkingDayDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.createWorkingDayService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created working day.'
  )
)

export const updateWorkingDayAction = createAsyncThunk(
  'classRoutine/updateWorkingDay',
  catchAsync(
    async (data: {
      classId: number
      workingDayId: number
      body: TUpdateWorkingDayDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.updateWorkingDayService(
        data.classId,
        data.workingDayId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully updated working day.'
  )
)

export const deleteWorkingDayAction = createAsyncThunk(
  'classRoutine/deleteWorkingDay',
  catchAsync(
    async (data: {
      classId: number
      workingDayId: number
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.deleteWorkingDayService(
        data.classId,
        data.workingDayId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully deleted working day.'
  )
)

// MARK: - SCHEDULE TEMPLATE
export const getScheduleTemplateListAction = createAsyncThunk(
  'classRoutine/getScheduleTemplateList',
  catchAsync(async (data: { classId: number }) => {
    const res = await classRoutineServices.getScheduleTemplateListService(
      data.classId
    )

    return res.data
  })
)

export const createScheduleTemplateAction = createAsyncThunk(
  'classRoutine/createScheduleTemplate',
  catchAsync(
    async (data: {
      classId: number
      body: TCreateScheduleTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.createScheduleTemplateService(
        data.classId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully created schedule template.'
  )
)

export const updateScheduleTemplateAction = createAsyncThunk(
  'classRoutine/updateScheduleTemplate',
  catchAsync(
    async (data: {
      classId: number
      scheduleTemplateId: number
      body: TUpdateScheduleTemplateDto
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.updateScheduleTemplateService(
        data.classId,
        data.scheduleTemplateId,
        data.body
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully updated schedule template.'
  )
)

export const deleteScheduleTemplateAction = createAsyncThunk(
  'classRoutine/deleteScheduleTemplate',
  catchAsync(
    async (data: {
      classId: number
      scheduleTemplateId: number
      onSuccess?: () => void
    }) => {
      const res = await classRoutineServices.deleteScheduleTemplateService(
        data.classId,
        data.scheduleTemplateId
      )
      data.onSuccess?.()

      return res
    },
    true,
    false,
    'Successfully deleted schedule template.'
  )
)

const classRoutineSlice = createSlice({
  name: 'classRoutine',
  initialState,
  reducers: {
    // clears the grid while a different class/section is being loaded
    resetRoutineList: (state) => {
      state.routineList.data = null
    },
  },
  extraReducers: (builders) => {
    // GET CLASS ROUTINE LIST
    builders.addCase(getClassRoutineListAction.pending, (state) => {
      state.routineList.loading = true
    })
    builders.addCase(getClassRoutineListAction.fulfilled, (state, action) => {
      state.routineList.loading = false
      state.routineList.data = action.payload
    })
    builders.addCase(getClassRoutineListAction.rejected, (state) => {
      state.routineList.loading = false
    })
    // GET MY ROUTINE LIST
    builders.addCase(getMyRoutineListAction.pending, (state) => {
      state.myRoutineList.loading = true
    })
    builders.addCase(getMyRoutineListAction.fulfilled, (state, action) => {
      state.myRoutineList.loading = false
      state.myRoutineList.data = action.payload
    })
    builders.addCase(getMyRoutineListAction.rejected, (state) => {
      state.myRoutineList.loading = false
    })
    // CREATE CLASS ROUTINE
    builders.addCase(createClassRoutineAction.pending, (state) => {
      state.createRoutine.loading = true
    })
    builders.addCase(createClassRoutineAction.fulfilled, (state) => {
      state.createRoutine.loading = false
    })
    builders.addCase(createClassRoutineAction.rejected, (state) => {
      state.createRoutine.loading = false
    })
    // UPDATE CLASS ROUTINE
    builders.addCase(updateClassRoutineAction.pending, (state) => {
      state.updateRoutine.loading = true
    })
    builders.addCase(updateClassRoutineAction.fulfilled, (state) => {
      state.updateRoutine.loading = false
    })
    builders.addCase(updateClassRoutineAction.rejected, (state) => {
      state.updateRoutine.loading = false
    })
    // DELETE CLASS ROUTINE
    builders.addCase(deleteClassRoutineAction.pending, (state) => {
      state.deleteRoutine.loading = true
    })
    builders.addCase(deleteClassRoutineAction.fulfilled, (state) => {
      state.deleteRoutine.loading = false
    })
    builders.addCase(deleteClassRoutineAction.rejected, (state) => {
      state.deleteRoutine.loading = false
    })
    // GET TIME SLOT LIST
    builders.addCase(getTimeSlotListAction.pending, (state) => {
      state.timeSlotList.loading = true
    })
    builders.addCase(getTimeSlotListAction.fulfilled, (state, action) => {
      state.timeSlotList.loading = false
      state.timeSlotList.data = action.payload
    })
    builders.addCase(getTimeSlotListAction.rejected, (state) => {
      state.timeSlotList.loading = false
    })
    // CREATE / UPDATE / DELETE TIME SLOT
    builders.addCase(createTimeSlotAction.pending, (state) => {
      state.timeSlotMutation.loading = true
    })
    builders.addCase(createTimeSlotAction.fulfilled, (state) => {
      state.timeSlotMutation.loading = false
    })
    builders.addCase(createTimeSlotAction.rejected, (state) => {
      state.timeSlotMutation.loading = false
    })
    builders.addCase(updateTimeSlotAction.pending, (state) => {
      state.timeSlotMutation.loading = true
    })
    builders.addCase(updateTimeSlotAction.fulfilled, (state) => {
      state.timeSlotMutation.loading = false
    })
    builders.addCase(updateTimeSlotAction.rejected, (state) => {
      state.timeSlotMutation.loading = false
    })
    builders.addCase(deleteTimeSlotAction.pending, (state) => {
      state.timeSlotMutation.loading = true
    })
    builders.addCase(deleteTimeSlotAction.fulfilled, (state) => {
      state.timeSlotMutation.loading = false
    })
    builders.addCase(deleteTimeSlotAction.rejected, (state) => {
      state.timeSlotMutation.loading = false
    })
    /* WORKING_DAY_AND_TEMPLATE_EXTRA_REDUCERS */
    // GET WORKING DAY LIST
    builders.addCase(getWorkingDayListAction.pending, (state) => {
      state.workingDayList.loading = true
    })
    builders.addCase(getWorkingDayListAction.fulfilled, (state, action) => {
      state.workingDayList.loading = false
      state.workingDayList.data = action.payload
    })
    builders.addCase(getWorkingDayListAction.rejected, (state) => {
      state.workingDayList.loading = false
    })
    // CREATE / UPDATE / DELETE WORKING DAY
    builders.addCase(createWorkingDayAction.pending, (state) => {
      state.workingDayMutation.loading = true
    })
    builders.addCase(createWorkingDayAction.fulfilled, (state) => {
      state.workingDayMutation.loading = false
    })
    builders.addCase(createWorkingDayAction.rejected, (state) => {
      state.workingDayMutation.loading = false
    })
    builders.addCase(updateWorkingDayAction.pending, (state) => {
      state.workingDayMutation.loading = true
    })
    builders.addCase(updateWorkingDayAction.fulfilled, (state) => {
      state.workingDayMutation.loading = false
    })
    builders.addCase(updateWorkingDayAction.rejected, (state) => {
      state.workingDayMutation.loading = false
    })
    builders.addCase(deleteWorkingDayAction.pending, (state) => {
      state.workingDayMutation.loading = true
    })
    builders.addCase(deleteWorkingDayAction.fulfilled, (state) => {
      state.workingDayMutation.loading = false
    })
    builders.addCase(deleteWorkingDayAction.rejected, (state) => {
      state.workingDayMutation.loading = false
    })
    // GET SCHEDULE TEMPLATE LIST
    builders.addCase(getScheduleTemplateListAction.pending, (state) => {
      state.scheduleTemplateList.loading = true
    })
    builders.addCase(
      getScheduleTemplateListAction.fulfilled,
      (state, action) => {
        state.scheduleTemplateList.loading = false
        state.scheduleTemplateList.data = action.payload
      }
    )
    builders.addCase(getScheduleTemplateListAction.rejected, (state) => {
      state.scheduleTemplateList.loading = false
    })
    // CREATE / UPDATE / DELETE SCHEDULE TEMPLATE
    builders.addCase(createScheduleTemplateAction.pending, (state) => {
      state.scheduleTemplateMutation.loading = true
    })
    builders.addCase(createScheduleTemplateAction.fulfilled, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
    builders.addCase(createScheduleTemplateAction.rejected, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
    builders.addCase(updateScheduleTemplateAction.pending, (state) => {
      state.scheduleTemplateMutation.loading = true
    })
    builders.addCase(updateScheduleTemplateAction.fulfilled, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
    builders.addCase(updateScheduleTemplateAction.rejected, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
    builders.addCase(deleteScheduleTemplateAction.pending, (state) => {
      state.scheduleTemplateMutation.loading = true
    })
    builders.addCase(deleteScheduleTemplateAction.fulfilled, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
    builders.addCase(deleteScheduleTemplateAction.rejected, (state) => {
      state.scheduleTemplateMutation.loading = false
    })
  },
})

export const { resetRoutineList } = classRoutineSlice.actions

export default classRoutineSlice.reducer
