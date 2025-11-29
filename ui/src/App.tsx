import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppInitializer } from './components/AppInitializer'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Guestbook from './pages/Guestbook'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <AppInitializer />
      <Routes>
        {/* Auth callback route (outside Layout) */}
        <Route path="auth/callback" element={<AuthCallback />} />

        {/* Main app routes */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="guestbook" element={<Guestbook />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
