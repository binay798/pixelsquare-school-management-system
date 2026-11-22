import React, { useRef } from 'react'

export const useDebounceValue = <T>(value: T, timeout?: number) => {
  const [searchValue, setSearchValue] = React.useState<T>(value)

  // `setTimeout` returns a `number` in the DOM lib but `Timeout` when
  // @types/node is present, so derive the type instead of hardcoding it.
  const handlerRef = useRef<ReturnType<typeof setTimeout> | undefined>()

  React.useEffect(() => {
    handlerRef.current = setTimeout(function () {
      setSearchValue(value)
    }, timeout ?? 500)
    return () => {
      clearTimeout(handlerRef.current)
    }
  }, [value, timeout])

  return searchValue
}
