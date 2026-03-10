import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './Context/ContextShop.jsx'
import { Provider } from 'react-redux'
import { ThemeProvider } from './Context/ThemeContext.jsx'
createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
