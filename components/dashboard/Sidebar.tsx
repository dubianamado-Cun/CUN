import React from 'react';
import { LogOut, File, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Logo from '../ui/Logo';

interface SidebarProps {
  navItems: { id: string; label: string; icon: React.ElementType }[];
  currentView: string;
  fileName: string;
  onReset: () => void;
  ticketCount: number;
  lastUpdated: Date | null;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, currentView, fileName, onReset, ticketCount, lastUpdated }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  
  const handleNavClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formattedDate = lastUpdated
      ? lastUpdated.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

  return (
    <nav className={`flex flex-col bg-card text-text-primary shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`px-4 pb-1 flex items-center relative ${isCollapsed ? 'justify-center' : 'justify-center'}`}>
            {!isCollapsed && <Logo />}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className={`p-2 rounded-md hover:bg-gray-200 ${isCollapsed ? '' : 'absolute top-1/2 right-4 -translate-y-1/2'}`}
            >
                {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
        </div>
        
        {!isCollapsed && (
            <div className="px-4 pb-4 text-center">
                <p className="text-xs text-text-secondary">Última Actualización: {formattedDate}</p>
            </div>
        )}

      <div className={`border-t border-gray-200 p-4 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center text-primary">
              <File size={isCollapsed ? 24 : 20} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-2 font-semibold">Dataset</span>}
          </div>
          {!isCollapsed && (
            <div className="mt-2 text-sm text-text-secondary">
                <p className="truncate" title={fileName}>{fileName}</p>
                <p><span className="font-bold text-text-primary">{ticketCount.toLocaleString()}</span> tickets mostrados</p>
            </div>
          )}
      </div>

      <ul className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center p-3 text-sm font-medium rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-emerald-100 text-primary' 
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={onReset}
          className={`w-full flex items-center p-3 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Subir Nuevo Archivo</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;