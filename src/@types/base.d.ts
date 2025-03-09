export interface BaseAttribute {
  id: number
  created_at: string
  updated_at: string
}

export type CmnOmit<T, K extends string | number = ''> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | K
>
