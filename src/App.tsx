import { useState } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import Toast from './components/Toast'

function App() {
  return (
    <div className="container">
      <MainLayout />
      <Toast />
    </div>
  )
}

export default App
