
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, GraduationCap, Users, FileText, MessageCircle, 
  Award, Layout, User, LogOut
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Layout size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Resources', path: '/resources', icon: <FileText size={20} /> },
    { name: 'Projects', path: '/projects', icon: <BookOpen size={20} /> },
    { name: 'Q&A Forum', path: '/qa', icon: <MessageCircle size={20} /> },
    { name: 'Mentorship', path: '/mentorship', icon: <Users size={20} /> },
    { name: 'Opportunities', path: '/opportunities', icon: <GraduationCap size={20} /> },
    { name: 'Achievements', path: '/achievements', icon: <Award size={20} /> },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;

    return (
      <Link to={item.path} className="w-full">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 font-medium",
            isActive ? "bg-secondary text-primary" : "hover:bg-secondary/50"
          )}
        >
          {item.icon}
          {isOpen && <span>{item.name}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card flex flex-col border-r transition-all duration-300 overflow-y-auto",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className={cn("p-4 flex items-center", !isOpen && "justify-center")}>
        <Link to="/" className="flex items-center justify-center">
          <img 
            src="/logo1.png" 
            alt="AcademiaNexus Logo" 
            className={cn(
              "w-auto", 
              isOpen ? "h-12" : "h-8"
            )} 
          />
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      <div className="p-4">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={toggleSidebar}>
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
