import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/reducers.store.ts'
import { Toast } from './components/toast/toast.component.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toast>
        <App />
      </Toast>
    </Provider>
  </React.StrictMode>
)
