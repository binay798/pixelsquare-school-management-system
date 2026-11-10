declare namespace TinyMce {
  interface IEditor {
    id: string
    initialized: boolean
    getContent(options?: { format?: 'html' | 'text' }): string
    setContent(content: string, options?: { format?: 'html' | 'text' }): void
    getBody(): HTMLElement
    focus(): void
    remove(): void
    on(
      events: string,
      callback: (event: unknown, editor: IEditor) => void
    ): void
    off(
      events: string,
      callback?: (event: unknown, editor: IEditor) => void
    ): void
    fire(events: string, data?: Record<string, unknown>): void
    mode: {
      set(mode: 'design' | 'readonly'): void
      get(): string
    }
  }

  interface IInitOptions {
    target?: HTMLElement | string
    base_url?: string
    suffix?: string
    height?: number
    min_height?: number
    max_height?: number
    menubar?: boolean | string
    plugins?: string
    toolbar?: string
    toolbar_mode?: string
    branding?: boolean
    promotion?: boolean
    statusbar?: boolean
    resize?: boolean | 'both'
    readonly?: boolean
    content_style?: string
    content_css?: string | false
    skin?: string | false
    contextmenu?: string | false
    browser_spellcheck?: boolean
    ui_container?: HTMLElement | string
    setup?: (editor: IEditor) => void
    init_instance_callback?: (editor: IEditor) => void
    [key: string]: unknown
  }

  interface IApi {
    init(options: IInitOptions): Promise<IEditor[]>
    get(): IEditor[]
    get(id: string): IEditor | undefined
    remove(editor: IEditor | string): void
    Editors?: IEditor[]
    activeEditor?: IEditor | null
  }
}

interface Window {
  tinymce?: TinyMce.IApi
}
