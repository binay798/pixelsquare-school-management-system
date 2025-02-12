import { Box, Collapse, List, Typography } from '@mui/material'
import {
  Container,
  ListContainer,
  ListItemBtn,
  ListItemIconContainer,
  ListItemTitle,
  ToggleIcon,
} from './sidebar.styles'
import { colors } from '@src/helpers/colors.helpers'
import { BiSolidDashboard } from 'react-icons/bi'
import { MdKeyboardArrowRight } from 'react-icons/md'
import React, { useState } from 'react'
import { config, useSpring } from '@react-spring/web'
import { GenerateAdminSidebarProps } from './sidebar.types'
import { isEmpty } from 'lodash'
import { CgComponents } from 'react-icons/cg'
import { ImStatsDots } from 'react-icons/im'
import { AiFillDatabase } from 'react-icons/ai'
import {
  BsBarChartFill,
  BsFillChatDotsFill,
  BsFillCalendarDayFill,
  BsKanban,
} from 'react-icons/bs'
import { RiCustomerService2Fill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
// import { GenerateAdminSidebarProps } from './sidebar.types'
// import { isEmpty } from 'lodash'

const sidebarItems: GenerateAdminSidebarProps[] = [
  {
    title: 'Dashboard',
    icon: <BiSolidDashboard />,
    subItems: [
      { title: 'Default', icon: <CgComponents /> },
      {
        title: 'Analytics',
        icon: <BsBarChartFill />,
        subItems: [
          { title: 'Default', icon: <BiSolidDashboard /> },
          { title: 'Analytics', icon: <BiSolidDashboard /> },
        ],
      },
    ],
  },
  {
    title: 'Components',
    icon: <CgComponents />,
  },
  {
    title: 'Statistics',
    icon: <ImStatsDots size={20} />,
  },
  {
    title: 'Data',
    icon: <AiFillDatabase />,
  },
  {
    title: 'Chart',
    icon: <BsBarChartFill />,
  },

  {
    title: 'Chat',
    icon: <BsFillChatDotsFill />,
  },
  {
    title: 'Calendar',
    icon: <BsFillCalendarDayFill />,
  },
  {
    title: 'Kanban',
    icon: <BsKanban />,
  },
  {
    title: 'Customer',
    icon: <RiCustomerService2Fill />,
    subItems: [
      { title: 'List', icon: 'L' },
      { title: 'Card', icon: 'C' },
    ],
  },
  // next
  {
    title: 'Components',
    icon: <CgComponents />,
  },
  {
    title: 'Statistics',
    icon: <ImStatsDots size={20} />,
  },
  {
    title: 'Data',
    icon: <AiFillDatabase />,
  },
  {
    title: 'Chart',
    icon: <BsBarChartFill />,
  },

  {
    title: 'Chat',
    icon: <BsFillChatDotsFill />,
  },
  {
    title: 'Calendar',
    icon: <BsFillCalendarDayFill />,
  },
  {
    title: 'Kanban',
    icon: <BsKanban />,
  },
  {
    title: 'Customer',
    icon: <RiCustomerService2Fill />,
    subItems: [
      { title: 'List', icon: 'L' },
      { title: 'Card', icon: 'C' },
    ],
  },
]

const renderNestedEl = (data?: GenerateAdminSidebarProps[]) => {
  const navigate = useNavigate()

  return (
    <List>
      {data?.map((el, id) => {
        return (
          <div key={id}>
            {!isEmpty(el.subItems) ? (
              <MemoizedCollapsableListItem data={el} />
            ) : (
              <>
                <ListItemBtn
                  onClick={() => el.to && navigate(el.to)}
                  disableRipple={false}
                >
                  <ListItemIconContainer>{el.icon}</ListItemIconContainer>
                  <ListItemTitle title="Dashboard" primary={el.title} />
                </ListItemBtn>
                {/* <Divider color={colors.grey[800]} /> */}
              </>
            )}
          </div>
        )
      })}
    </List>
  )
}

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
      <ListContainer>{renderNestedEl(sidebarItems)}</ListContainer>
    </Container>
  )
}

function CollapsableListItem({ data }: { data: GenerateAdminSidebarProps }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const handleClick = () => {
    setOpen(!open)
  }
  const toggle = useSpring({
    from: { rotate: '0deg' },
    to: { rotate: open ? '90deg' : '0deg' },
    config: config.stiff,
  })

  return (
    <>
      <ListItemBtn disableRipple={false} onClick={handleClick}>
        <ListItemIconContainer>{data.icon}</ListItemIconContainer>
        <ListItemTitle primary={data.title} />
        <ToggleIcon style={toggle}>
          <ListItemIconContainer style={{ minWidth: 0 }}>
            <MdKeyboardArrowRight style={{ width: 20, height: 20 }} />
          </ListItemIconContainer>
        </ToggleIcon>
      </ListItemBtn>
      {/* <Divider color={colors.grey[800]} /> */}
      <Box sx={{ marginLeft: 5 }}>
        <Collapse
          in={open}
          timeout={100}
          easing={'cubic-bezier(.57,.5,.84,.87)'}
          sx={{ borderLeft: '0.5px solid #5a5858' }}
        >
          {data?.subItems?.map((el, id) => {
            return (
              // <div key={id} style={{ marginLeft: 10 }}>
              <div
                key={id}
                style={{
                  marginLeft: 0,
                  // backgroundColor: '#07050e',
                }}
              >
                {!isEmpty(el.subItems) ? (
                  <MemoizedCollapsableListItem data={el} />
                ) : (
                  <>
                    <ListItemBtn
                      disableRipple={false}
                      onClick={() => el.to && navigate(el.to)}
                    >
                      <ListItemIconContainer>{el.icon}</ListItemIconContainer>
                      <ListItemTitle title="Dashboard" primary={el.title} />
                    </ListItemBtn>
                  </>
                )}
              </div>
            )
          })}
        </Collapse>
      </Box>
    </>
  )
}

const MemoizedCollapsableListItem = React.memo(CollapsableListItem)
