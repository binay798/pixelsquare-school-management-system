import {
  Box,
  CircularProgress,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { TextareaField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import {
  getTinyMceBaseUrl,
  isRichTextEmpty,
  loadTinyMce,
} from './tinyMce.helpers'

type Status = 'loading' | 'ready' | 'error'

interface Props {
  value?: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  helperText?: string
  height?: number
  compact?: boolean
  name?: string
}

const TOOLBAR =
  'undo redo | blocks | bold italic underline strikethrough | forecolor | bullist numlist outdent indent | alignleft aligncenter alignright | link table | removeformat | code preview fullscreen'

const COMPACT_TOOLBAR =
  'undo redo | bold italic underline | bullist numlist | alignleft aligncenter alignright | link | removeformat | code'

const PLUGINS =
  'lists link table code autolink fullscreen preview searchreplace visualblocks'

const CONTENT_STYLE = `
  body {
    position: relative;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 13.5px;
    line-height: 1.7;
    color: #1f2937;
    padding: 10px 12px;
    margin: 0;
  }
  body.tinymce-placeholder-visible::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 10px;
    left: 12px;
    right: 12px;
    color: #9ca3af;
    font-size: 13.5px;
    line-height: 1.7;
    pointer-events: none;
  }
  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 8px;
    line-height: 1.35;
    font-weight: 700;
  }
  h1 { font-size: 19px; }
  h2 { font-size: 17px; }
  h3 { font-size: 15.5px; }
  h4 { font-size: 14px; }
  h5 { font-size: 13px; }
  h6 { font-size: 12.5px; }
  ul, ol { margin: 0 0 8px; padding-left: 22px; }
  li { margin-bottom: 4px; }
  a { color: #2463eb; text-decoration: underline; }
  blockquote {
    margin: 0 0 8px;
    padding-left: 12px;
    border-left: 3px solid #e5e7eb;
    color: #4b5563;
  }
  code {
    padding: 1px 4px;
    border-radius: 4px;
    background: #f3f4f6;
    font-family: Menlo, Consolas, monospace;
    font-size: 12.5px;
  }
  pre {
    padding: 10px;
    border-radius: 6px;
    background: #f3f4f6;
    overflow-x: auto;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
  th { background: #f9fafb; font-weight: 700; }
  img { max-width: 100%; height: auto; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
`

let editorSeq = 0

export function TinyMceEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  height = 200,
  compact = false,
  name,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<TinyMce.IEditor | null>(null)
  const lastValueRef = useRef<string>(value ?? '')
  const disabledRef = useRef<boolean>(disabled)
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)
  const [status, setStatus] = useState<Status>('loading')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onBlurRef.current = onBlur
  }, [onBlur])

  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    let disposed = false
    let instance: TinyMce.IEditor | null = null

    const target = document.createElement('div')
    editorSeq += 1
    target.id = `tinymce-editor-${editorSeq}`
    host.appendChild(target)

    const syncFromEditor = () => {
      if (!instance || disposed) {
        return
      }

      const html = instance.getContent()

      if (html === lastValueRef.current) {
        return
      }

      lastValueRef.current = html
      onChangeRef.current(html)
    }

    const init = async () => {
      try {
        await loadTinyMce()

        if (disposed) {
          return
        }

        const api = window.tinymce

        if (!api) {
          throw new Error('TinyMCE is not available')
        }

        const baseUrl = getTinyMceBaseUrl()

        const editors = await api.init({
          target,
          ...(baseUrl ? { base_url: baseUrl } : {}),
          height,
          menubar: false,
          statusbar: false,
          branding: false,
          promotion: false,
          resize: false,
          skin: 'oxide',
          content_css: false,
          content_style: CONTENT_STYLE,
          plugins: compact ? 'lists link code' : PLUGINS,
          toolbar: compact ? COMPACT_TOOLBAR : TOOLBAR,
          toolbar_mode: 'wrap',
          browser_spellcheck: true,
          setup: (editor) => {
            editor.on('input change undo redo', () => {
              syncFromEditor()
            })
            editor.on('focus', () => {
              setFocused(true)
            })
            editor.on('blur', () => {
              setFocused(false)
              syncFromEditor()
              onBlurRef.current?.()
            })
          },
        })

        const editor = editors?.[0]

        if (!editor) {
          throw new Error('TinyMCE editor could not be created')
        }

        if (disposed) {
          editor.remove()

          return
        }

        instance = editor
        editorRef.current = editor

        if (lastValueRef.current) {
          editor.setContent(lastValueRef.current)
        }

        if (disabledRef.current) {
          editor.mode.set('readonly')
        }

        setStatus('ready')
      } catch {
        if (!disposed) {
          setStatus('error')
        }
      }
    }

    void init()

    return () => {
      disposed = true
      editorRef.current = null

      if (instance) {
        instance.remove()
        instance = null
      }

      target.remove()
    }
    // The editor instance is created once per mounted component on purpose.
  }, [])

  useEffect(() => {
    const next = value ?? ''

    if (next === lastValueRef.current) {
      return
    }

    lastValueRef.current = next
    const editor = editorRef.current

    if (!editor || status !== 'ready') {
      return
    }

    if (editor.getContent() !== next) {
      editor.setContent(next)
    }
  }, [value, status])

  useEffect(() => {
    const editor = editorRef.current

    if (!editor || status !== 'ready') {
      return
    }

    editor.mode.set(disabled ? 'readonly' : 'design')
  }, [disabled, status])

  const showPlaceholder =
    status === 'ready' && !focused && isRichTextEmpty(value)

  useEffect(() => {
    const editor = editorRef.current

    if (!editor || status !== 'ready') {
      return
    }

    const body = editor.getBody()

    if (!body) {
      return
    }

    body.setAttribute('data-placeholder', placeholder ?? '')
    body.classList.toggle('tinymce-placeholder-visible', showPlaceholder)
  }, [placeholder, showPlaceholder, status])

  if (status === 'error') {
    return (
      <Box sx={{ width: '100%' }}>
        <TextareaField
          variant="outlined"
          name={name}
          placeholder={placeholder}
          multiline
          minRows={4}
          value={value ?? ''}
          disabled={disabled}
          error={error}
          onChange={(event) => onChange(event.target.value)}
        />
        <FormHelperText error>
          The rich text editor could not be loaded, the plain text editor is
          being used instead.
        </FormHelperText>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          minHeight: status === 'loading' ? height : undefined,
          borderRadius: 2,
          border: `1px solid ${error ? colors.red[400] : colors.grey[300]}`,
          bgcolor: disabled ? colors.grey[50] : '#fff',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:focus-within': {
            borderColor: error ? colors.red[400] : colors.blue[500],
            boxShadow: `0 0 0 3px ${
              error ? 'rgba(239,68,68,0.12)' : 'rgba(36,99,235,0.12)'
            }`,
          },
          '& .tox-tinymce': {
            // TinyMCE lays its chrome out as a flex column; restate it so noisy
            // global resets/tailwind can never collapse the edit area to 0px.
            display: 'flex',
            flexDirection: 'column',
            border: 'none',
            borderRadius: 2,
          },
          '& .tox .tox-editor-container': {
            flex: '1 1 auto',
            minHeight: 0,
          },
          '& .tox .tox-edit-area': {
            flex: '1 1 auto',
            minHeight: 0,
          },
          '& .tox .tox-editor-header': {
            boxShadow: 'none',
            borderBottom: `1px solid ${colors.grey[200]}`,
          },
          '& .tox .tox-toolbar-overlord, & .tox .tox-toolbar__primary': {
            backgroundColor: colors.grey[50],
          },
          '& .tox .tox-edit-area::before': {
            border: 'none',
          },
          '& .tox .tox-statusbar': {
            display: 'none',
          },
        }}
      >
        <Box ref={hostRef} sx={{ '& > div': { width: '100%' } }} />
        {status === 'loading' ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#fff',
            }}
          >
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={18} />
              <Typography fontSize={11.5} color={colors.grey[500]}>
                Loading editor...
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </Box>
      {helperText ? (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      ) : null}
    </Box>
  )
}
