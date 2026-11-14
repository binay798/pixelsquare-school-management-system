import { Box, Collapse, List, Stack, Typography } from '@mui/material'
import {
  MdKeyboardArrowRight,
  MdOutlineDashboardCustomize,
  MdAdminPanelSettings,
  MdOutlineAssignment,
  MdCampaign,
  MdOutlineNotificationsActive,
} from 'react-icons/md'
import { FaSchool } from 'react-icons/fa'
import { animated } from '@react-spring/web'
import { IoSchool } from 'react-icons/io5'
import { PiStudentFill } from 'react-icons/pi'
import { FaPersonCirclePlus } from 'react-icons/fa6'
import { FaSitemap } from 'react-icons/fa'
import { PiBooksFill } from 'react-icons/pi'
import { SiGoogleclassroom } from 'react-icons/si'
import { BsFillSignIntersectionSideFill } from 'react-icons/bs'
import { GiBookmarklet } from 'react-icons/gi'
import { RiParentFill } from 'react-icons/ri'
import { GiTeacher } from 'react-icons/gi'
import { HiUserAdd } from 'react-icons/hi'
import { VscChecklist } from 'react-icons/vsc'
import { FaChalkboardTeacher } from 'react-icons/fa'
import { FaUsersGear } from 'react-icons/fa6'
import { GrTableAdd } from 'react-icons/gr'
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

import { useNavigate } from 'react-router-dom'
import { useAdminSidebar } from './adminSidebar.context'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import {
  FeePermission,
  hasFeePermission,
} from '@src/pages/dashboard/pages/fees/fees.helpers'
import {
  hasAccountingPermission,
  isAccountingPermission,
} from '@src/pages/dashboard/pages/accounting/accounting.helpers'
import { MdAccountBalance, MdPayments } from 'react-icons/md'

/**
 * A sidebar item declares the permission that unlocks it. Accounting
 * permissions and fee permissions are namespaced (`accounting.*` / `fee.*`) so
 * the right matrix can be resolved without touching the item declarations.
 */
const hasSidebarPermission = (
  roles: string[] | undefined,
  permission: string
) =>
  isAccountingPermission(permission)
    ? hasAccountingPermission(roles, permission)
    : hasFeePermission(roles, permission as FeePermission)

/** Hides the items the current user has no permission for (fee + accounting). */
const filterSidebarItems = (
  items: GenerateAdminSidebarProps[],
  roles: string[] | undefined
): GenerateAdminSidebarProps[] =>
  items
    .filter((item) =>
      item.permissions?.length
        ? item.permissions.some((permission) =>
            hasSidebarPermission(roles, permission)
          )
        : true
    )
    .map((item) => ({
      ...item,
      subItems: item.subItems
        ? filterSidebarItems(item.subItems, roles)
        : undefined,
    }))

const sidebarItems: GenerateAdminSidebarProps[] = [
  {
    title: 'Dashboard',
    icon: <BiSolidDashboard />,
    to: '/dashboard',
    // subItems: [
    //   { title: 'Default', icon: <CgComponents /> },
    //   {
    //     title: 'Analytics',
    //     icon: <BsBarChartFill />,
    //     subItems: [
    //       { title: 'Default', icon: <BiSolidDashboard /> },
    //       { title: 'Analytics', icon: <BiSolidDashboard /> },
    //     ],
    //   },
    // ],
  },
  {
    title: 'Administrator',
    icon: <MdAdminPanelSettings />,
    to: '/dashboard/administrator',
    subItems: [
      {
        title: 'Manage School',
        icon: <FaSchool />,
        to: '/dashboard/administrator/manage-school',
      },
      {
        title: 'Academic Year',
        icon: <IoSchool />,
        to: '/dashboard/administrator/academic-year',
      },
    ],
  },
  {
    title: 'Human Resource',
    icon: <FaPersonCirclePlus />,
    to: '/dashboard/human-resources',
    subItems: [
      {
        title: 'Manage Designation',
        icon: <FaSitemap />,
        to: '/dashboard/human-resources',
      },
      {
        title: 'Manage Employee',
        icon: <IoSchool />,
        to: '/dashboard/human-resources/manage-employee',
      },
    ],
  },
  {
    title: 'Teachers',
    icon: <GiTeacher />,
    to: '/dashboard/teachers',
    subItems: [
      {
        title: 'Manage Departments',
        icon: <MdOutlineDashboardCustomize />,
        to: '/dashboard/teachers/departments',
      },
      {
        title: 'Manage Teachers',
        icon: <HiUserAdd />,
        to: '/dashboard/teachers',
      },
    ],
  },
  {
    title: 'Academics',
    icon: <PiBooksFill />,
    to: '/dashboard/human-resources',
    subItems: [
      {
        title: 'Classes',
        icon: <SiGoogleclassroom />,
        to: '/dashboard/academics/classes',
      },
      {
        title: 'Sections',
        icon: <BsFillSignIntersectionSideFill />,
        to: '/dashboard/academics/class-sections',
      },
      {
        title: 'Subjects',
        icon: <GiBookmarklet />,
        to: '/dashboard/academics/class-subjects',
      },
      {
        title: 'Class Routines',
        icon: <GrTableAdd />,
        to: '/dashboard/academics/class-routines',
      },
      {
        title: 'Lesson Plan',
        icon: <MdOutlineAssignment />,
        to: '/dashboard/academics/lesson-plan',
      },
    ],
  },
  {
    title: 'Announcements',
    icon: <MdCampaign />,
    to: '/dashboard/academics/announcements',
  },
  {
    title: 'Notice Board',
    icon: <MdOutlineNotificationsActive />,
    to: '/dashboard/academics/announcements/feed',
  },
  {
    title: 'Guardian',
    icon: <RiParentFill />,
    to: '/dashboard/guardian',
  },
  {
    title: 'Fee Management',
    icon: <MdPayments />,
    to: '/dashboard/fees',
    subItems: [
      {
        title: 'Fee Dashboard',
        icon: <BiSolidDashboard />,
        to: '/dashboard/fees',
        permissions: ['fee.dashboard.view'],
      },
      {
        title: 'Fee Types',
        icon: <FaSchool />,
        to: '/dashboard/fees/types',
        permissions: ['fee.types.view'],
      },
      {
        title: 'Fee Templates',
        icon: <VscChecklist />,
        to: '/dashboard/fees/templates',
        permissions: ['fee.templates.view'],
      },
      {
        title: 'Student Assignments',
        icon: <PiStudentFill />,
        to: '/dashboard/fees/assignments',
        permissions: ['fee.assignments.manage', 'fee.templates.view'],
      },
      {
        title: 'Scholarships & Discounts',
        icon: <MdOutlineAssignment />,
        to: '/dashboard/fees/scholarships',
        permissions: ['fee.scholarships.manage', 'fee.templates.view'],
      },
      {
        title: 'Late Fee Rules',
        icon: <MdOutlineNotificationsActive />,
        to: '/dashboard/fees/late-fees',
        permissions: ['fee.late_fees.manage', 'fee.templates.view'],
      },
      {
        title: 'Invoices',
        icon: <PiBooksFill />,
        to: '/dashboard/fees/invoices',
        permissions: ['fee.invoices.view'],
      },
      {
        title: 'Collect Payment',
        icon: <MdPayments />,
        to: '/dashboard/fees/payments/collect',
        permissions: ['fee.payments.collect'],
      },
      {
        title: 'Payment History',
        icon: <MdOutlineDashboardCustomize />,
        to: '/dashboard/fees/payments',
        permissions: ['fee.payments.view'],
      },
      {
        title: 'Student Wallets',
        icon: <FaSitemap />,
        to: '/dashboard/fees/wallets',
        permissions: ['fee.wallets.view'],
      },
      {
        title: 'Refunds & Adjustments',
        icon: <MdOutlineAssignment />,
        to: '/dashboard/fees/refunds',
        permissions: ['fee.refunds.view'],
      },
      {
        title: 'Defaulters',
        icon: <FaUsersGear />,
        to: '/dashboard/fees/defaulters',
        permissions: ['fee.defaulters.view'],
      },
      {
        title: 'Fee Reports',
        icon: <GrTableAdd />,
        to: '/dashboard/fees/reports',
        permissions: ['fee.reports.view'],
      },
      {
        title: 'Accounting Sync',
        icon: <VscChecklist />,
        to: '/dashboard/fees/accounting',
        permissions: ['fee.accounting_sync.view'],
      },
    ],
  },

  {
    title: 'Accounting',
    icon: <MdAccountBalance />,
    to: '/dashboard/accounting',
    permissions: ['accounting.view'],
    subItems: [
      {
        title: 'Overview',
        icon: <BiSolidDashboard />,
        to: '/dashboard/accounting',
        permissions: ['accounting.view'],
      },
      {
        title: 'Chart of Accounts',
        icon: <MdOutlineDashboardCustomize />,
        to: '/dashboard/accounting/accounts',
        permissions: ['accounting.view'],
      },
      {
        title: 'Journal Entries',
        icon: <VscChecklist />,
        to: '/dashboard/accounting/journal',
        permissions: ['accounting.view'],
      },
      {
        title: 'Periods',
        icon: <GrTableAdd />,
        to: '/dashboard/accounting/periods',
        permissions: ['accounting.view'],
      },
      {
        title: 'Reports',
        icon: <GrTableAdd />,
        to: '/dashboard/accounting/reports',
        permissions: ['accounting.reports.view'],
      },
    ],
  },

  {
    title: 'Manage Student',
    icon: <PiStudentFill />,
    to: '/dashboard/manage-students',
    subItems: [
      {
        title: 'Student Type',
        icon: <FaSchool />,
        to: '/dashboard/manage-students/student-type',
      },
      {
        title: 'Student List',
        icon: <IoSchool />,
        to: '/dashboard/manage-students/students-list',
      },
      {
        title: 'Admit Student',
        icon: <FaSchool />,
        to: '/dashboard/manage-students/admit-students',
      },
      {
        title: 'Bulk Admission',
        icon: <IoSchool />,
        to: '/dashboard/students/academic-year',
      },
    ],
  },
  {
    title: 'Attendance',
    icon: <VscChecklist />,
    subItems: [
      {
        title: 'Student Attendance',
        icon: <PiStudentFill />,
        to: '/dashboard/attendance/student',
      },
      {
        title: 'Teacher Attendance',
        icon: <FaChalkboardTeacher />,
        to: '/dashboard/attendance/teachers',
      },
      {
        title: 'Employee Attendance',
        icon: <FaUsersGear />,
        to: '/dashboard/attendance/employees',
      },
    ],
  },
  // {
  //   title: 'Components',
  //   icon: <CgComponents />,
  // },
  // {
  //   title: 'Statistics',
  //   icon: <ImStatsDots size={20} />,
  // },
  // {
  //   title: 'Data',
  //   icon: <AiFillDatabase />,
  // },
  // {
  //   title: 'Chart',
  //   icon: <BsBarChartFill />,
  // },

  // {
  //   title: 'Chat',
  //   icon: <BsFillChatDotsFill />,
  // },
  // {
  //   title: 'Calendar',
  //   icon: <BsFillCalendarDayFill />,
  // },
  // {
  //   title: 'Kanban',
  //   icon: <BsKanban />,
  // },
  // {
  //   title: 'Customer',
  //   icon: <RiCustomerService2Fill />,
  //   subItems: [
  //     { title: 'List', icon: 'L' },
  //     { title: 'Card', icon: 'C' },
  //   ],
  // },
  // // next
  // {
  //   title: 'Components',
  //   icon: <CgComponents />,
  // },
  // {
  //   title: 'Statistics',
  //   icon: <ImStatsDots size={20} />,
  // },
  // {
  //   title: 'Data',
  //   icon: <AiFillDatabase />,
  // },
  // {
  //   title: 'Chart',
  //   icon: <BsBarChartFill />,
  // },

  // {
  //   title: 'Chat',
  //   icon: <BsFillChatDotsFill />,
  // },
  // {
  //   title: 'Calendar',
  //   icon: <BsFillCalendarDayFill />,
  // },
  // {
  //   title: 'Kanban',
  //   icon: <BsKanban />,
  // },
  // {
  //   title: 'Customer',
  //   icon: <RiCustomerService2Fill />,
  //   subItems: [
  //     { title: 'List', icon: 'L' },
  //     { title: 'Card', icon: 'C' },
  //   ],
  // },
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
  return <MainContainer />
}

export function MainContainer() {
  const { openSidebar } = useAdminSidebar()
  const { roles } = useFeePermissions()
  const visibleItems = filterSidebarItems(sidebarItems, roles)
  const springWidth = useSpring({
    from: {
      width: 290,
    },
    to: {
      width: openSidebar ? 290 : 90,
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
          <RenderNestedEl data={visibleItems} />
        </ListContainer>
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
    <div>
      <ListItemBtn
        disableRipple={false}
        onClick={handleClick}
        sx={{
          marginBottom: '0px !important',
        }}
      >
        <ListItemIconContainer>{data.icon}</ListItemIconContainer>
        {openSidebar ? <ListItemTitle primary={data.title} /> : null}
        {/* <animated.div style={hideText}>
          <ListItemTitle primary={data.title} />
        </animated.div> */}
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
          sx={{
            borderLeft: '0.5px dashed #5a5858',
          }}
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
                  <div>
                    <ListItemBtn
                      disableRipple={false}
                      onClick={() => el.to && navigate(el.to)}
                    >
                      <ListItemIconContainer>{el.icon}</ListItemIconContainer>
                      {openSidebar ? (
                        <ListItemTitle title="Dashboard" primary={el.title} />
                      ) : null}
                    </ListItemBtn>
                  </div>
                )}
              </div>
            )
          })}
        </Collapse>
      </Box>
    </div>
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
