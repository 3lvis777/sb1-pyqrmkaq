import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Tags, 
  FolderTree, 
  Image, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    labelCn: '仪表板',
    path: '/admin'
  },
  {
    icon: FileText,
    label: 'Articles',
    labelCn: '文章',
    path: '/admin/articles'
  },
  {
    icon: FolderTree,
    label: 'Categories',
    labelCn: '分类',
    path: '/admin/categories'
  },
  {
    icon: Tags,
    label: 'Tags',
    labelCn: '标签',
    path: '/admin/tags'
  },
  {
    icon: Image,
    label: 'Media',
    labelCn: '媒体',
    path: '/admin/media'
  },
  {
    icon: Settings,
    label: 'Settings',
    labelCn: '设置',
    path: '/admin/settings'
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${
                  isActive ? 'text-red-500' : 'text-gray-400'
                }`} />
                <span>{item.label}</span>
                <span className="ml-2 text-sm opacity-75">{item.labelCn}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-400" />
            <span>Sign Out</span>
            <span className="ml-2 text-sm opacity-75">退出</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="h-16 bg-white shadow-sm flex items-center px-6 border-b">
          <div className="flex-1" />
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}