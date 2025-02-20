import { AxiosError } from 'axios'
import { isEmpty } from 'lodash'

export function errResponse(
  err: AxiosError<{ data: { message: string } }> | unknown,
  toastDetails?: {
    toastId?: string
    successMsg?: string
    failureMsg?: string
  }
): string {
  if (err instanceof AxiosError) {
    if (err.isAxiosError) {
      if (
        Array.isArray(err?.response?.data.data?.data) &&
        err?.response?.data?.data?.data?.length > 0
      ) {
        const errors = err?.response?.data.data.data
        const errorMessageArr = errors?.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el: any) => `${el?.param}: ${el?.message}`
        )
        if (isEmpty(toastDetails?.failureMsg)) {
          return errorMessageArr
        }
      }

      return toastDetails?.failureMsg ?? err?.response?.data.data.message
    } else {
      return err.message
    }
  } else {
    return 'Something went wrong'
  }
}
