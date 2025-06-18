import { useState } from 'react';
import Sidebar from './Sidebar';
import SimpleHeader from './SimpleHeader';

export default function MainLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="lg:ml-64">
        <SimpleHeader onSidebarToggle={toggleSidebar} title={title} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
