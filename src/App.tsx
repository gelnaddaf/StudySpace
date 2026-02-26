import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import StudySpace from '@/pages/StudySpace'
import Notes from '@/pages/Notes'
import LearningOutcomes from '@/pages/LearningOutcomes'
import Dashboard from '@/pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<StudySpace />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/learning-outcomes" element={<LearningOutcomes />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
