import React from 'react'
import { Toaster } from 'react-hot-toast'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/reducers.store.ts'
import { MuiThemeProvider } from './muiTheme.styles.tsx'
import ErrorBoundary from './helpers/errorBoundary.helpers.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <MuiThemeProvider>
          <App />
          <Toaster
            toastOptions={{
              success: {
                icon: (
                  <img
                    src="/icons/check.png"
                    width={20}
                    height={20}
                    style={{ objectFit: 'contain' }}
                  />
                ),
                style: {
                  border: '1px solid #d8d4d2ec',
                  padding: '14px',
                  color: '#fff',
                  fontSize: 14,
                  background: '#FF8585',
                  boxShadow:
                    'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;',
                },
              },

              error: {
                icon: (
                  <img
                    src="/icons/remove.png"
                    width={20}
                    height={20}
                    style={{ objectFit: 'contain' }}
                  />
                ),

                style: {
                  border: '1px solid #d8d4d2ec',
                  padding: '14px',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  background: '#ff4545',
                  boxShadow:
                    'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;',
                },
              },

              position: 'top-center',
            }}
          />
        </MuiThemeProvider>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
)
