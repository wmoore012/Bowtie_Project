import './App.css'
import { useState } from 'react'
import { BowtieGraph } from './components/bowtie/BowtieGraph'
import { highwayDrivingExample } from './domain/scenarios/highway_driving.example'
import { Sidebar } from './components/layout/Sidebar'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const leftPad = sidebarCollapsed ? 72 : 280
  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <div style={{ padding: 12, marginLeft: leftPad }}>
        <h2 style={{ margin: 0 }}>Highway Driving Risk (Neutral Teaching Scenario)</h2>
        <small>Track 2 – Generic Bowtie visualization (6-column, no degradation)</small>
      </div>
      <div style={{ marginLeft: leftPad }}>
        <BowtieGraph diagram={highwayDrivingExample} />
      </div>
    </>
  )
}

export default App
