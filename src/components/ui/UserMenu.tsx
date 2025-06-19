import React, { useState } from 'react'

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <span className="text-sm font-medium">U</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <a href="#" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
              Profile
            </a>
            <a href="#" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
              Settings
            </a>
            <hr className="my-1 border-border" />
            <a href="#" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
              Sign out
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu