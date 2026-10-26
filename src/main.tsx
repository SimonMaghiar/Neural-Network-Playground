import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { interceptLinks, upgradeHashUrl } from './router'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

interceptLinks()
if (upgradeHashUrl()) root.replaceChildren()

if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
