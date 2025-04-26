import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Toast, ToastContainer } from './components/Toast';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Events } from './pages/Events';
import { EventChat } from './pages/EventChat';
import { CreateEvent } from './pages/CreateEvent';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { Feed } from './pages/Feed';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<Events />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/events/:id/chat" element={<EventChat />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>
      </div>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default App;