import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/reducers.store.ts'
import { Toast } from './components/toast/toast.component.tsx'
import { MuiThemeProvider } from './muiTheme.styles.tsx'
import ErrorBoundary from './helpers/errorBoundary.helpers.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <MuiThemeProvider>
          <Toast>
            <App />
          </Toast>
        </MuiThemeProvider>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
)
