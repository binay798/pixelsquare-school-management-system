import { useToast } from '@src/components/toast/toast.hooks'

export function Homepage() {
  const { success } = useToast()
  const clickedHandler = () => {
    success('hello there' + Date.now())
  }

  return (
    <div>
      Homepage
      <button onClick={clickedHandler}>Add toast</button>
    </div>
  )
}
