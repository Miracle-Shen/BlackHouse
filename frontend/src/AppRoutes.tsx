import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout-simple'
import FeedPage from './pages/FeedPage'
import PublishPage from './pages/PublishPage'
import MinePage from './pages/MinePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="publish" element={<PublishPage />} />
        <Route path="mine" element={<MinePage />} />
      </Route>
    </Routes>
  )
}

export default App