import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const AppShell = () => {
  return (
    <div className="fixed inset-0 flex h-screen overflow-hidden m-0 p-0 bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto h-full py-0 bg-muted/80">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

