import { Box, Card, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CreateGuardianComp } from '../../components/createGuardianComp/createGuardian.component'
import { LinkedStudentsComp } from './components/linkedStudentsComp/linkedStudents.component'

export function EditGuardianPage() {
  const { guardianId } = useParams()
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Guardian Profile" />
        <Tab label="Linked Students" />
      </Tabs>

      {tab === 0 ? (
        <CreateGuardianComp />
      ) : (
        <Card sx={{ p: 2 }}>
          {guardianId ? (
            <LinkedStudentsComp guardianId={Number(guardianId)} />
          ) : null}
        </Card>
      )}
    </Box>
  )
}
