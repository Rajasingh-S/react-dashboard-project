import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = Cookies.get('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
        setToken(storedToken);
      } catch (error) {
        logout();
      }
    }
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    setUser(decoded);
    setToken(token);
    Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'strict' });
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('authToken');
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!token && !isTokenExpired();
  };

  const isTokenExpired = () => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);