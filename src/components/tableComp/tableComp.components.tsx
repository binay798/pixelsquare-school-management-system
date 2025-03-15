import Table from '@mui/material/Table'
import { MdOutlineSearch, MdEdit } from 'react-icons/md'
import { AiOutlineFilePdf } from 'react-icons/ai'
import { AiOutlineFileExcel } from 'react-icons/ai'
import { PiFileCsvLight } from 'react-icons/pi'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { IoWarningOutline } from 'react-icons/io5'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { IoIosArrowDown } from 'react-icons/io'
import { TablePaper, THeadCell } from './tableComp.styles'
import { colors } from '@src/helpers/colors.helpers'
import { InputField } from '../input/input.component'
import { ButtonComp } from '../button/button.component'
import React, { useEffect, useState } from 'react'
import { isEmpty, isNumber } from 'lodash'
import { IoTrashOutline } from 'react-icons/io5'
import { LuEye } from 'react-icons/lu'
import { DeleteConfirmationModal } from '../confirmationModal/deleteConfirmationModal.component'
import { updateSearchParams } from '@src/helpers/getPageParams.helper'
import { DEFAULT_PAGE_LIMIT } from '@src/constants/table.constants'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'

interface Props<T, K extends Extract<keyof T, string>> {
  columns: Array<{
    field: K | 'custom'
    name: string | React.ReactNode
    colStyle?: React.CSSProperties
    render?: (
      value: React.ReactNode,
      item: T,
      index?: number
    ) => React.ReactNode
  }>
  data: Array<T>
  actions?: {
    onEdit?: (item: T) => void
    onDelete?: (item: T, onClose?: () => void) => void
    onView?: (item: T) => void
  }
  loading?: boolean
  showPagination?: boolean
  count?: number
  rowsPerPage?: number
  page?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >
  deleteConfirmationModalDescription?: React.ReactElement
  deleteConfirmLoader?: boolean
  deleteCancelText?: string
  limits?: number[]
  search?: (val: string) => void
}

export function TableComp<T, K extends Extract<keyof T, string>>({
  showPagination = true,
  limits = [5, 10, 15],
  ...props
}: Props<T, K>) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)
  const [searchText, setSearchText] = useState('')
  const searchVal = useDebounceValue(searchText)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const [selectedLimit, setSelectedLimit] = useState(limits[0])
  const handleClose = (limitVal: number) => {
    if (isNumber(limitVal)) {
      setSelectedLimit(limitVal)
    }
    setAnchorEl(null)
  }

  useEffect(() => {
    if (isNumber(Number(selectedLimit))) {
      updateSearchParams('limit', String(selectedLimit))
    }
  }, [selectedLimit])

  useEffect(() => {
    props?.search?.(searchVal)
  }, [searchVal])

  return (
    <TableContainer component={TablePaper}>
      <Box p={1} mt={1}>
        <Stack
          direction="row"
          alignItems={'center'}
          justifyContent={'space-between'}
          gap={3}
        >
          <ButtonGroup
            variant="outlined"
            color="secondary"
            aria-label="Basic button group"
          >
            <ButtonComp
              tooltipTitle="Download PDF"
              tooltipPlacement="top"
              startIcon={<AiOutlineFilePdf />}
              size="small"
            >
              Pdf
            </ButtonComp>
            <ButtonComp
              tooltipTitle="Download Excel"
              tooltipPlacement="top"
              startIcon={<AiOutlineFileExcel />}
              size="small"
            >
              Excel
            </ButtonComp>
            <ButtonComp
              tooltipTitle="Download CSV"
              tooltipPlacement="top"
              startIcon={<PiFileCsvLight />}
              size="small"
            >
              CSV
            </ButtonComp>
          </ButtonGroup>
          <InputField
            startAdornment={
              <MdOutlineSearch size={28} color={colors.grey[500]} />
            }
            placeholder="Search"
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              width: 300,
              marginLeft: 'auto',
            }}
          />
        </Stack>
      </Box>
      <Table
        sx={{ minWidth: 650, borderTop: '1px solid ' + colors.grey[300] }}
        aria-label="simple table"
      >
        <TableHead sx={{ backgroundColor: '#0f0b26' }}>
          <TableRow>
            {props.columns.map((el, i) => {
              return (
                <THeadCell key={i} align={'left'}>
                  {el.name}
                </THeadCell>
              )
            })}
            {!isEmpty(props.actions) ? (
              <THeadCell align={'right'}>Actions</THeadCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((dt, dtIndex) => {
            return (
              <TableRow
                key={dtIndex}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {props.columns.map((col, index) => {
                  if (col.render) {
                    return (
                      <TableCell key={index} align="left">
                        {col.render(
                          col.field ? (dt[col.field as K] as string) : 'N/A',
                          dt,
                          dtIndex
                        )}
                      </TableCell>
                    )
                  } else {
                    return (
                      <TableCell key={index} align="left">
                        {col.field ? (dt[col.field as K] as string) : 'N/A'}
                      </TableCell>
                    )
                  }
                })}
                {!isEmpty(props.actions) ? (
                  <TableCell>
                    <Stack
                      direction="row"
                      justifyContent={'flex-end'}
                      spacing={1}
                      flexShrink={0}
                    >
                      {props?.actions?.onView ? (
                        <Tooltip title="View" placement="top">
                          <IconButton
                            onClick={() => {
                              props?.actions?.onView?.(dt)
                            }}
                            sx={{ flexShrink: 0 }}
                          >
                            {/* <MdEye size={20} /> */}
                            <LuEye size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {props?.actions?.onEdit ? (
                        <Tooltip title="Edit" placement="top">
                          <IconButton
                            onClick={() => {
                              props?.actions?.onEdit?.(dt)
                            }}
                            sx={{ flexShrink: 0 }}
                          >
                            <MdEdit size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      {props?.actions?.onDelete ? (
                        <Tooltip title="Delete" placement="top">
                          <IconButton
                            onClick={() => {
                              setSelectedRow(dt)
                              setOpenDeleteModal(true)
                            }}
                            sx={{ flexShrink: 0 }}
                          >
                            <IoTrashOutline size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}

          {props?.loading ? (
            <TableRow>
              {Array(props?.columns?.length)
                .fill(0)
                ?.map((_, id) => (
                  <TableCell key={id}>
                    <Skeleton variant="rounded" height={25} />
                  </TableCell>
                ))}
              <TableCell align="right">
                <Skeleton variant="rounded" height={25} />
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      {showPagination ? (
        <Stack
          direction="row"
          spacing={2}
          alignItems={'center'}
          justifyContent={'flex-end'}
          color="GrayText"
          p={2}
        >
          <Stack direction="row" alignItems={'center'} spacing={1}>
            <Typography variant="body2">Rows per page</Typography>
            <Box>
              <Button
                id="demo-positioned-button-pagination"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                color="secondary"
                endIcon={<IoIosArrowDown size={14} color={colors.grey[500]} />}
              >
                {selectedLimit}
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button-pagination"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {limits?.map((el, id) => {
                  return (
                    <MenuItem
                      key={id}
                      onClick={() => {
                        if (isNumber(el)) {
                          handleClose(el)
                        }
                      }}
                    >
                      {el}
                    </MenuItem>
                  )
                })}
              </Menu>
            </Box>
          </Stack>
          <Pagination
            count={Math.ceil(
              Number(props?.count || 1) / Number(props?.rowsPerPage || 1)
            )}
            variant="outlined"
            shape="rounded"
            page={Number(props?.page)}
            onChange={(_, page) => {
              props.onPageChange?.(page)
              updateSearchParams('page', String(Number(page || 1)))
              if (isNumber(Number(props?.rowsPerPage))) {
                updateSearchParams(
                  'limit',
                  String(Number(props?.rowsPerPage || DEFAULT_PAGE_LIMIT))
                )
              }
            }}
          />
        </Stack>
      ) : null}
      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        onClose={() => {
          setOpenDeleteModal(false)
        }}
        onConfirmationClick={() => {
          if (selectedRow) {
            props?.actions?.onDelete?.(selectedRow, () => {
              setOpenDeleteModal(false)
            })
          }
        }}
        open={openDeleteModal}
        confirmText="Delete"
        cancelText={props.deleteCancelText}
        confirmLoader={props.deleteConfirmLoader}
      >
        {props.deleteConfirmationModalDescription ? (
          props.deleteConfirmationModalDescription
        ) : (
          <Card
            sx={{
              p: 2,
              background: '#fefcea',
              border: `1px solid ${colors.grey[400]}`,
            }}
          >
            <Stack
              direction={'row'}
              spacing={1}
              alignItems={'center'}
              justifyContent={'center'}
              mb={1}
            >
              <IoWarningOutline color={colors.red[400]} size={22} />
              <Typography fontWeight={600} color="error">
                Warning
              </Typography>
            </Stack>
            <Typography color="error" fontWeight={500}>
              This action is permanent and cannot be undone. Once deleted, the
              data will be lost and cannot be recovered
            </Typography>
          </Card>
        )}
      </DeleteConfirmationModal>
    </TableContainer>
  )
}
