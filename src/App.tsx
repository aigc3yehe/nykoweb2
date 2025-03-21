import { useState } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import Toast from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'

function App() {
  return (
    <div className="container">
      <MainLayout />
      <Toast />
      <ConfirmDialog />
    </div>
  )
}

export default App
