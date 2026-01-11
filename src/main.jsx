import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './index.css'

// 1. Buat client-nya di luar komponen agar tidak ter-render ulang
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data dianggap segar selama 5 menit
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Bungkus di sini sebagai kakek dari segala komponen */}
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* Devtools ini opsional, tapi sangat membantu buat debug data Laravel */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)