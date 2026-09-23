import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Role, User } from '../types';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  authData: AuthResponse | null;
  propertyId: string | null;
  setPropertyId: (id: string | null) => void;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  loginAsRole: (role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('abode_token'));
  const [authData, setAuthData] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem('abode_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [propertyId, setPropertyId] = useState<string | null>(() => {
    return authData?.propertyId || localStorage.getItem('abode_property_id') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (authData) {
      return {
        id: authData.userId,
        fullName: authData.fullName,
        phone: authData.phone,
        email: authData.email,
        role: authData.role,
        status: authData.status,
        languagePreference: authData.languagePreference,
        tenantId: authData.tenantId,
        propertyId: authData.propertyId,
      };
    }
    return null;
  });

  const saveAuth = (data: AuthResponse) => {
    setToken(data.token);
    setAuthData(data);
    setUser({
      id: data.userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      role: data.role,
      status: data.status,
      languagePreference: data.languagePreference,
      tenantId: data.tenantId,
      propertyId: data.propertyId,
    });
    localStorage.setItem('abode_token', data.token);
    localStorage.setItem('abode_auth', JSON.stringify(data));
    if (data.propertyId) {
      setPropertyId(data.propertyId);
      localStorage.setItem('abode_property_id', data.propertyId);
    }
  };

  // Auto-resolve propertyId if user is authenticated but propertyId is not stored
  useEffect(() => {
    const resolveMissingProperty = async () => {
      if (token && !propertyId && user) {
        try {
          if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
            const res = await api.get('/properties');
            if (res.data.success && res.data.data && res.data.data.length > 0) {
              const pId = res.data.data[0].id;
              setPropertyId(pId);
              localStorage.setItem('abode_property_id', pId);
            }
          }
        } catch (err) {
          console.error('Failed to auto-resolve propertyId', err);
        }
      }
    };
    resolveMissingProperty();
  }, [token, propertyId, user]);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        saveAuth(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (phone: string) => {
    await api.post('/auth/otp/request', { phone });
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { phone, otp });
      if (res.data.success) {
        saveAuth(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = async (role: Role) => {
    let identifier = '9876543210';
    let password = 'Owner@123';

    if (role === 'COOK') {
      identifier = '9876543211';
      password = 'Cook@123';
    } else if (role === 'TENANT') {
      identifier = '9876543212';
      password = 'Tenant@123';
    }

    await login(identifier, password);
  };

  const logout = () => {
    setToken(null);
    setAuthData(null);
    setUser(null);
    setPropertyId(null);
    localStorage.removeItem('abode_token');
    localStorage.removeItem('abode_auth');
    localStorage.removeItem('abode_property_id');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authData,
        propertyId,
        setPropertyId,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        loginWithOtp,
        requestOtp,
        loginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
