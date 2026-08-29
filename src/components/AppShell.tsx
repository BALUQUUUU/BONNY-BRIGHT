import React from 'react'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import ForestBackdrop from './ForestBackdrop'

type AppShellProps = {
  children: React.ReactNode
  atmosphere?: 'default' | 'forest'
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="forest-shell min-h-screen">
      <ForestBackdrop />
      <div className="shell-content relative z-10">
        <Navbar immersive />
        <main className="pb-28 pt-2 md:pb-16 md:pt-5">{children}</main>
        <BottomNav immersive />
      </div>
    </div>
  )
}

export default AppShell
