import {
  Box,
  Collapse,
  IconButton,
  List,
  Stack,
  Typography,
} from '@mui/material'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { animated } from '@react-spring/web'
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
// import { MdKeyboardArrowRight } from 'react-icons/md'
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
import { AdminSidebarContext, useAdminSidebar } from './adminSidebar.context'

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

const RenderNestedEl = ({ data }: { data?: GenerateAdminSidebarProps[] }) => {
  const navigate = useNavigate()
  const { openSidebar } = useAdminSidebar()
  const fadeStyle = useSpring({
    from: { opacity: 1 },
    to: {
      opacity: openSidebar ? 1 : 0,
    },
  })

  return (
    <List>
      {data?.map((el, id) => {
        return (
          <div key={id}>
            {!isEmpty(el.subItems) && openSidebar ? (
              <MemoizedCollapsableListItem data={el} />
            ) : (
              <>
                <ListItemBtn
                  onClick={() => el.to && navigate(el.to)}
                  disableRipple={false}
                >
                  <ListItemIconContainer>{el.icon}</ListItemIconContainer>
                  <animated.div style={{ ...fadeStyle }}>
                    <ListItemTitle title="Dashboard" primary={el.title} />
                  </animated.div>
                  {/* {openSidebar ? (
                    <ListItemTitle title="Dashboard" primary={el.title} />
                  ) : (
                    ''
                  )} */}
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
  // function MainContainer(props: MainContainerProps) {
  return (
    <AdminSidebarContext>
      <MainContainer />
    </AdminSidebarContext>
  )
}

export function MainContainer() {
  const { openSidebar, toggleShowSidebar } = useAdminSidebar()
  const springWidth = useSpring({
    from: {
      width: 380,
    },
    to: {
      width: openSidebar ? 380 : 90,
    },
  })
  const arrowRotate = useSpring({
    from: {
      rotate: '-180deg',
    },
    to: {
      rotate: openSidebar ? '-180deg' : '0deg',
    },
  })

  return (
    <animated.div
      style={{
        // height: '100vh',
        // borderRadius: 0,
        // maxHeight: 'unset',
        ...springWidth,
      }}
    >
      <Container>
        <AdminSidebarHeader />
        <ListContainer>
          <RenderNestedEl data={sidebarItems} />
        </ListContainer>
        <Stack direction={'row'} justifyContent={'flex-end'} pr={3.4}>
          <IconButton
            onClick={() => toggleShowSidebar?.(!openSidebar)}
            style={{ width: 'fit-content' }}
          >
            {/* <AiOutlineMenuFold color={colors.grey[300]} /> */}
            <animated.span style={arrowRotate}>
              <MdKeyboardArrowRight size={30} color={colors.grey[300]} />
            </animated.span>
          </IconButton>
        </Stack>
      </Container>
    </animated.div>
  )
}

function CollapsableListItem({ data }: { data: GenerateAdminSidebarProps }) {
  const { openSidebar } = useAdminSidebar()
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
        {openSidebar ? <ListItemTitle primary={data.title} /> : null}
        {openSidebar ? (
          <ToggleIcon style={toggle}>
            <ListItemIconContainer style={{ minWidth: 0 }}>
              <MdKeyboardArrowRight style={{ width: 20, height: 20 }} />
            </ListItemIconContainer>
          </ToggleIcon>
        ) : null}
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
                      {openSidebar ? (
                        <ListItemTitle title="Dashboard" primary={el.title} />
                      ) : null}
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

function AdminSidebarHeader() {
  const { openSidebar } = useAdminSidebar()
  const fadeLogoMainStyle = useSpring({
    from: { opacity: 1 },
    to: {
      opacity: openSidebar ? 1 : 0,
    },
  })
  const fadeLogoSecondaryStyle = useSpring({
    from: { opacity: 1 },
    to: { opacity: !openSidebar ? 1 : 0 },
  })

  return (
    <Box>
      <Stack
        p={2}
        pl={4}
        direction={'row'}
        // justifyContent={'space-between'}
        alignItems={'center'}
      >
        <animated.div style={fadeLogoSecondaryStyle}>
          <Typography
            variant="h6"
            textAlign={'center'}
            color={colors.grey[300]}
          >
            AP
          </Typography>
        </animated.div>
        <animated.div style={fadeLogoMainStyle}>
          <Stack direction="row" spacing={1} justifyContent={'space-between'}>
            <Typography
              variant="h6"
              textAlign={'center'}
              color={colors.grey[300]}
              sx={{ textWrap: 'nowrap' }}
            >
              Admin Panel
            </Typography>
            {/* <IconButton onClick={() => toggleShowSidebar?.(!openSidebar)}>
              <AiOutlineMenuFold color={colors.grey[300]} />
            </IconButton> */}
          </Stack>
        </animated.div>
      </Stack>
    </Box>
  )
}
