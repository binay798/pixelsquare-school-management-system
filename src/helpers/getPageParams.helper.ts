import { DEFAULT_PAGE_LIMIT } from '@src/constants/table.constants'
import { useLocation } from 'react-router-dom'

export function usePage() {
  const location = useLocation()
  const obj = new URLSearchParams(location.search)
  const page = obj.get('page')
  const limit = obj.get('limit')

  return { page: Number(page || 1), limit: Number(limit || DEFAULT_PAGE_LIMIT) }
}

export function updateSearchParams(param: string, value: string) {
  const [path, queryString] = window.location.hash.split('?')
  const params = new URLSearchParams(queryString || '')

  if (value) {
    params.set(param, value) // Add or update the param
  } else {
    params.delete(param) // Remove param if value is empty
  }

  window.location.hash = `${path}?${params.toString()}`
}
