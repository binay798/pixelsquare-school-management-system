import { useLocation } from 'react-router-dom'

export function usePage() {
  const location = useLocation()
  const obj = new URLSearchParams(location.search)
  const page = obj.get('page')
  const limit = obj.get('limit')

  return { page: Number(page || 1), limit: Number(limit || 3) }
}
