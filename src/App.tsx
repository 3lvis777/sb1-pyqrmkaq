import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Header from './components/Header';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProfilePage from './pages/Profile';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import Media from './pages/admin/Media';
import CityPage from './pages/CityPage';
import SignUp from './pages/SignUp';
import Articles from './pages/admin/Articles';
import ArticleForm from './pages/admin/ArticleForm';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'cn'>(
    new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'cn'
  );

  // Update language when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lang = params.get('lang');
    if (lang === 'cn' || lang === 'en') {
      setLanguage(lang);
    }
  }, [location.search]);

  // Update hreflang tags dynamically
  React.useEffect(() => {
    // Get the current URL without query parameters
    const baseUrl = window.location.origin + location.pathname;
    
    // Update or create hreflang tags
    const updateHreflangTags = () => {
      // Remove existing hreflang tags
      document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
      
      // Add new hreflang tags
      const tags = [
        { hreflang: 'en', href: baseUrl },
        { hreflang: 'zh', href: `${baseUrl}?lang=cn` },
        { hreflang: 'x-default', href: baseUrl }
      ];
      
      tags.forEach(({ hreflang, href }) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        link.href = href;
        document.head.appendChild(link);
      });
    };
    
    updateHreflangTags();
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/city/:cityId" element={<CityPage />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Articles />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <ArticleForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <ArticleForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tags"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Tags />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Media />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;