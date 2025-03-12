declare namespace Asset {
  interface IAsset {
    id: string
    created_at: string
    updated_at: string
    label: string
    path: string
    file_type: FileType
  }
}
