declare namespace Academics {
  interface IClass {
    id: number
    created_at: string
    updated_at: string
    name: string
    numeric_name: string
    school_id: number
  }

  interface IClassSection {
    id: number
    created_at: string
    updated_at: string
    name: string
    class_id: number
  }

  interface IClassSectionList {
    class_details: Pick<IClass, 'id' | 'name' | 'numeric_name'>
    section_details: IClassSection
  }
}
