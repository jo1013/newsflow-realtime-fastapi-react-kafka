import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import NewsPage from './pages/NewsPage';
import NewsDetail from './components/NewsDetail';
import SubscriptionList from './pages/SubscriptionList';


const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('jwt') !== null;
  if (!isLoggedIn) {
    return <Navigate replace to="/login" />;
  }
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsLoggedIn(token !== null);
  }, []);

  const onLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate replace to="/news" /> : <LoginPage onLoginSuccess={onLoginSuccess} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/news/:id" element={<ProtectedRoute><NewsDetail /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate replace to={isLoggedIn ? "/news" : "/login"} />} />
        <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionList /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;