import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/App'
import { ThemeProvider } from '@/components/ThemeProvider'
import './index.css'

const cache = createCache({
  key: 'css',
  prepend: true,
  stylisPlugins: [],
})

const Root = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Root />)
} else {
  console.error('Root element not found')
}
