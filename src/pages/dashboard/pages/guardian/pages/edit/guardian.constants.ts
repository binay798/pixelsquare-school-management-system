export const RELATIONSHIP_OPTIONS: {
  label: string
  value: Guardian.TRelationship
}[] = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Grandparent', value: 'grandparent' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Relative', value: 'relative' },
  { label: 'Local Guardian', value: 'local_guardian' },
  { label: 'Other', value: 'other' },
]

export const relationshipLabel = (value?: Guardian.TRelationship | null) =>
  RELATIONSHIP_OPTIONS.find((option) => option.value === value)?.label ?? '—'

export const PERMISSION_FIELDS: {
  key: keyof Guardian.IPermissionFlags
  label: string
  description: string
}[] = [
  {
    key: 'can_pickup_student',
    label: 'Can pick up student',
    description: 'Allowed to collect the student from school.',
  },
  {
    key: 'can_view_academics',
    label: 'Can view academics',
    description: 'Can see attendance, marks and report cards.',
  },
  {
    key: 'can_view_fees',
    label: 'Can view fees',
    description: 'Can see invoices, payments and dues.',
  },
  {
    key: 'receives_announcements',
    label: 'Receives announcements',
    description: 'Included in guardian announcement recipients.',
  },
  {
    key: 'is_emergency_contact',
    label: 'Emergency contact',
    description: 'Contacted first in case of an emergency.',
  },
]
