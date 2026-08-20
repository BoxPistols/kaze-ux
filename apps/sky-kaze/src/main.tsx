import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { SiteAnalytics } from '@/components/SiteAnalytics'

import { App } from './App'
import './index.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SiteAnalytics />
  </StrictMode>
)
