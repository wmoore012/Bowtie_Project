import './App.css'
import { useState } from 'react'
import { BowtieGraph } from './components/bowtie/BowtieGraph'
import { highwayDrivingExample } from './domain/scenarios/highway_driving.example'
import { Sidebar } from './components/layout/Sidebar'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true
      const stored = localStorage.getItem('sidebarExpanded')
      if (stored == null) return true // default collapsed
      return stored !== 'true' // collapsed is inverse of expanded
    } catch { return true }
  })
  const leftPad = sidebarCollapsed ? 72 : 280
  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <div style={{ marginLeft: leftPad, height: '100vh', overflow: 'hidden' }}>
        <BowtieGraph diagram={highwayDrivingExample} />
      </div>
    </>
  )
}

export default App
