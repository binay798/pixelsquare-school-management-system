import { STATIC_URL } from './api.helpers'

export function getImageUrl(path: string) {
  return `${STATIC_URL}/${path}`
}
