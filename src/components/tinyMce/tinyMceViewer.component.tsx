import { Box, SxProps, Theme, Typography } from '@mui/material'
import { useMemo } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { isRichTextEmpty, toRichTextHtml } from './tinyMce.helpers'

interface Props {
  content?: string | null
  emptyText?: string
  dense?: boolean
  sx?: SxProps<Theme>
}

const richTextStyles = {
  lineHeight: 1.7,
  color: colors.grey[800],
  wordBreak: 'break-word' as const,
  '& p': { margin: '0 0 8px' },
  '& p:last-child': { marginBottom: 0 },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: '12px 0 8px',
    lineHeight: 1.35,
    fontWeight: 700,
    color: colors.grey[900],
  },
  '& h1': { fontSize: 19 },
  '& h2': { fontSize: 17 },
  '& h3': { fontSize: 15.5 },
  '& h4': { fontSize: 14 },
  '& h5': { fontSize: 13 },
  '& h6': { fontSize: 12.5 },
  '& ul, & ol': { margin: '0 0 8px', paddingLeft: '22px' },
  '& li': { marginBottom: '4px' },
  '& li > ul, & li > ol': { margin: '4px 0 0' },
  '& a': {
    color: colors.blue[600],
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  '& strong, & b': { fontWeight: 700 },
  '& em, & i': { fontStyle: 'italic' },
  '& u': { textDecoration: 'underline' },
  '& s': { textDecoration: 'line-through' },
  '& blockquote': {
    margin: '0 0 8px',
    paddingLeft: '12px',
    borderLeft: `3px solid ${colors.grey[300]}`,
    color: colors.grey[700],
  },
  '& code': {
    px: 0.5,
    py: 0.1,
    borderRadius: 0.5,
    bgcolor: colors.grey[100],
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: '0.95em',
  },
  '& pre': {
    p: 1,
    borderRadius: 1,
    bgcolor: colors.grey[100],
    overflowX: 'auto',
    fontSize: '0.95em',
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '0 0 8px',
  },
  '& th, & td': {
    border: `1px solid ${colors.grey[200]}`,
    px: 1,
    py: 0.75,
    textAlign: 'left' as const,
  },
  '& th': { bgcolor: colors.grey[50], fontWeight: 700 },
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
  '& hr': { border: 'none', borderTop: `1px solid ${colors.grey[200]}`, my: 1 },
}

/**
 * Renders a stored rich text value (tinymce html) with the typography used by
 * the editor, so what the author wrote is what the reader sees.
 */
export function TinyMceViewer({
  content,
  emptyText = 'Not specified.',
  dense = false,
  sx,
}: Props) {
  const html = useMemo(() => toRichTextHtml(content), [content])

  if (isRichTextEmpty(content)) {
    return (
      <Typography
        fontSize={dense ? 12.5 : 13.5}
        color={colors.grey[400]}
        sx={{ lineHeight: 1.7 }}
      >
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box
      className="tiny-mce-viewer"
      sx={{
        ...richTextStyles,
        fontSize: dense ? 12.5 : 13.5,
        '& > *:first-of-type': { marginTop: 0 },
        '& > *:last-of-type': { marginBottom: 0 },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
