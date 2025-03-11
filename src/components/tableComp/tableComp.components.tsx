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
import {
  Box,
  ButtonGroup,
  IconButton,
  Skeleton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from '@mui/material'
import { TablePaper, THeadCell } from './tableComp.styles'
import { colors } from '@src/helpers/colors.helpers'
import { InputField } from '../input/input.component'
import { ButtonComp } from '../button/button.component'
import React, { useState } from 'react'
import { isEmpty } from 'lodash'
import { IoTrashOutline } from 'react-icons/io5'
import { LuEye } from 'react-icons/lu'
import { DeleteConfirmationModal } from '../confirmationModal/deleteConfirmationModal.component'

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
    onDelete?: (item: T) => void
    onView?: (item: T) => void
  }
  loading?: boolean
  showPagination?: boolean
  count?: number
  rowsPerPage?: number
  page?: number
  onPageChange?: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void
  onRowsPerPageChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >
  deleteConfirmationModalDescription?: string
}

export function TableComp<T, K extends Extract<keyof T, string>>({
  showPagination = true,
  ...props
}: Props<T, K>) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)

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
        <TableHead sx={{ backgroundColor: colors.grey[100] }}>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={Number(props?.count || 1)}
          rowsPerPage={Number(props?.rowsPerPage || 10)}
          page={Number(props?.page || 1)}
          // @ts-ignore
          onPageChange={props.onPageChange}
          onRowsPerPageChange={props.onRowsPerPageChange}
        />
      ) : null}
      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        onClose={() => {
          setOpenDeleteModal(false)
        }}
        onConfirmationClick={() => {
          if (selectedRow) {
            props?.actions?.onDelete?.(selectedRow)
          }
        }}
        open={openDeleteModal}
        confirmText="Delete"
      >
        <Typography>{props.deleteConfirmationModalDescription}</Typography>
      </DeleteConfirmationModal>
    </TableContainer>
  )
}
