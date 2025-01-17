import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Utensils, ShoppingBag, Menu, X, Globe, LogIn } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MainNavProps {
  defaultLanguage?: 'en' | 'cn';
  onLanguageChange?: (language: 'en' | 'cn') => void;
}

export default function MainNav({ defaultLanguage = 'en', onLanguageChange }: MainNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'cn'>(
    searchParams.get('lang') === 'en' ? 'en' : 'cn'
  );

  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang === 'cn' || lang === 'en') {
      setCurrentLanguage(lang);
    }
  }, [location.search]);

  const handleLanguageChange = (newLanguage: 'en' | 'cn') => {
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    } else {
      const params = new URLSearchParams(location.search);
      params.set('lang', newLanguage);
      setCurrentLanguage(newLanguage);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const menuItems = [
    {
      to: '/category/entertainment',
      icon: MapPin,
      label: 'Destinations',
      labelCn: '目的地'
    },
    {
      to: '/category/food',
      icon: Utensils,
      label: 'Where to Eat',
      labelCn: '美食'
    },
    {
      to: '/category/shopping',
      icon: ShoppingBag,
      label: 'Shopping',
      labelCn: '购物'
    }
  ];

  return (
    <nav className="flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-between flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <MapPin className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-xl font-bold">Japan Guide</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-end space-x-8 flex-1 ml-12">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors group"
                  >
                    <Icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span>{currentLanguage === 'en' ? item.label : item.labelCn}</span>
                  </Link>
                );
              })}
              {/* Desktop Language Switcher */}
              <div className="flex items-center bg-white/90 rounded-lg p-1.5 border border-gray-200 shadow-sm">
                <Globe className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 mr-3">
                  {currentLanguage === 'en' ? 'Language' : '语言'}:
                </span>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-md border border-r-0 ${
                      currentLanguage === 'en'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('cn')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-md border ${
                      currentLanguage === 'cn'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>{currentLanguage === 'en' ? 'Login' : '登录'}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        } md:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg">
          <div className="h-full flex flex-col">
            {/* Mobile menu header */}
            <div className="px-4 py-6 bg-red-50">
              <div className="flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <MapPin className="h-8 w-8 text-red-500" />
                  <span className="ml-2 text-xl font-bold">Japan Guide</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-red-500 hover:bg-red-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Language Switcher */}
              <div className="flex items-center bg-white/50 rounded-lg p-2">
                <Globe className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 mr-3">
                  {currentLanguage === 'en' ? 'Language' : '语言'}:
                </span>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-md border border-r-0 ${
                      currentLanguage === 'en'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('cn')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-md border ${
                      currentLanguage === 'cn'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu items */}
            <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const label = currentLanguage === 'en' ? item.label : item.labelCn;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Icon className="h-6 w-6 mr-3" />
                    <div>
                      <span className="font-medium block">{label}</span>
                    </div>
                  </Link>
                );
              })}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-4 border-t border-gray-100"
                >
                  <LogIn className="h-6 w-6 mr-3" />
                  <div>
                    <span className="font-medium block">
                      {currentLanguage === 'en' ? 'Login' : '登录'}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}