import { Divider, Typography } from '@mui/material'
import { Container } from './sidebar.styles'
import { colors } from '@src/helpers/colors.helpers'
// import { GenerateAdminSidebarProps } from './sidebar.types'
// import { isEmpty } from 'lodash'

// const renderNestedEl = (data?: GenerateAdminSidebarProps[]) => {
//   return (
//     <div style={{ color: 'white' }}>
//       {data?.map((el, id) => {
//         return (
//           <ul key={id} style={{ marginLeft: 4 }}>
//             <li>{el.title}</li>
//             {!isEmpty(el.subItems) && renderNestedEl(el.subItems)}
//           </ul>
//         )
//       })}
//     </div>
//   )
// }

export function AdminSidebar() {
  return (
    <Container>
      <Typography
        variant="h6"
        textAlign={'center'}
        padding={2}
        color={colors.grey[300]}
      >
        Admin Panel
      </Typography>
      <Divider color={colors.grey[400]} />
      {/* {renderNestedEl(x)} */}
    </Container>
  )
}
