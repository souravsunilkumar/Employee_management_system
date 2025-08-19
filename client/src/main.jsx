import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/styles.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { BrowserRouter } from 'react-router-dom'
import { MainContextProvider } from './context/mainContext.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <MainContextProvider>
        <ToastContainer />
        <App />
      </MainContextProvider>
    </BrowserRouter>
  </Provider>,
)
