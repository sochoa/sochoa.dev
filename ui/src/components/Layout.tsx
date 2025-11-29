import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-primary relative font-mono">
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 217, 255, 0.15) 0%, rgba(0, 217, 255, 0.05) 20%, transparent 60%)',
        }}
      />
      <Header />
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
