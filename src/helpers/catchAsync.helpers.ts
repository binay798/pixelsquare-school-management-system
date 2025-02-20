import { toast } from 'react-hot-toast'
import type { AsyncThunkPayloadCreator } from '@reduxjs/toolkit'

import { errResponse } from './errResponse.helper'

export function catchAsync<FnReturnType, FnArgType>(
  fn: (arg: FnArgType) => Promise<FnReturnType>,
  showToast = false,
  isPromisedToast = false,
  successMsg?: string,
  failureMsg?: string
): AsyncThunkPayloadCreator<FnReturnType, FnArgType> {
  return async (args) => {
    try {
      const resPromise = fn(args)

      showToast &&
        isPromisedToast &&
        toast.promise(resPromise, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          success: (res: any) => {
            return successMsg ?? res.message
          },
          loading: 'Please wait...',
          error: (res) =>
            errResponse(failureMsg ?? res ?? 'Something went wrong.'),
        })
      const res = await resPromise
      showToast &&
        !isPromisedToast &&
        toast.success(successMsg ?? (res as { message: string })?.message)

      return res
    } catch (err) {
      showToast &&
        !isPromisedToast &&
        toast.error(errResponse(failureMsg ?? err ?? 'Something went wrong.'))

      if (typeof args['catchFailure' as keyof typeof args] === 'function') {
        // @ts-ignore
        args['catchFailure' as keyof typeof args]?.()
      }
      throw err
    }
  }
}
