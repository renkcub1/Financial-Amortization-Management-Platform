import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  users: [
    {
      id: 1,
      email: 'admin@kpcs.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-01',
      lastLogin: '2024-01-15',
      permissions: ['all']
    },
    {
      id: 2,
      email: 'advisor@kpcs.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'advisor',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-05',
      lastLogin: '2024-01-14',
      permissions: ['view_all_loans', 'manage_clients', 'generate_reports']
    },
    {
      id: 3,
      email: 'client@kpcs.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'client',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-10',
      lastLogin: '2024-01-15',
      permissions: ['view_own_loans', 'manage_own_profile']
    },
    {
      id: 4,
      email: 'viewer@kpcs.com',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'viewer',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-12',
      lastLogin: '2024-01-13',
      permissions: ['view_reports']
    }
  ],
  roles: {
    admin: {
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      color: 'danger'
    },
    advisor: {
      name: 'Financial Advisor',
      description: 'Can manage clients and view financial data',
      permissions: ['view_all_loans', 'manage_clients', 'generate_reports', 'view_analytics'],
      color: 'primary'
    },
    client: {
      name: 'Client',
      description: 'Can manage own loans and view personal data',
      permissions: ['view_own_loans', 'manage_own_loans', 'manage_own_profile'],
      color: 'success'
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access to reports and analytics',
      permissions: ['view_reports', 'view_analytics'],
      color: 'warning'
    }
  }
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        users: state.users.map(user => 
          user.id === state.user.id ? { ...user, ...action.payload } : user
        )
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, { ...action.payload, id: Date.now() }]
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_ROLE':
      const roleKey = action.payload.name.toLowerCase().replace(/\s+/g, '_');
      return {
        ...state,
        roles: { ...state.roles, [roleKey]: action.payload }
      };
    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: { ...state.roles, [action.payload.key]: action.payload.data }
      };
    case 'DELETE_ROLE':
      const { [action.payload]: deletedRole, ...remainingRoles } = state.roles;
      return {
        ...state,
        roles: remainingRoles
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = state.users.find(u => u.email === email);
        if (user && password === 'password123') {
          // Simple password check for demo
          const userWithSession = {
            ...user,
            lastLogin: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(userWithSession));
          dispatch({ type: 'LOGIN_SUCCESS', payload: userWithSession });
          resolve(userWithSession);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      status: 'active',
      permissions: state.roles[userData.role]?.permissions || []
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
  };

  const updateUser = (userId, updates) => {
    // Update permissions based on role
    if (updates.role && state.roles[updates.role]) {
      updates.permissions = state.roles[updates.role].permissions;
    }
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, ...updates } });
  };

  const deleteUser = (userId) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const addRole = (roleData) => {
    dispatch({ type: 'ADD_ROLE', payload: roleData });
  };

  const updateRole = (roleKey, roleData) => {
    dispatch({ type: 'UPDATE_ROLE', payload: { key: roleKey, data: roleData } });

    // Update users with this role to have new permissions
    const usersWithRole = state.users.filter(user => user.role === roleKey);
    usersWithRole.forEach(user => {
      dispatch({
        type: 'UPDATE_USER',
        payload: { id: user.id, permissions: roleData.permissions }
      });
    });
  };

  const deleteRole = (roleKey) => {
    dispatch({ type: 'DELETE_ROLE', payload: roleKey });
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.permissions.includes('all')) return true;
    return state.user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const canAccessPage = (page) => {
    const pagePermissions = {
      '/': ['view_own_loans', 'view_all_loans', 'all'],
      '/loans': ['view_own_loans', 'view_all_loans', 'manage_own_loans', 'all'],
      '/calculator': ['view_own_loans', 'view_all_loans', 'all'],
      '/optimization': ['view_own_loans', 'view_all_loans', 'all'],
      '/savings': ['view_own_loans', 'view_all_loans', 'all'],
      '/alerts': ['view_own_loans', 'view_all_loans', 'all'],
      '/scenarios': ['view_own_loans', 'view_all_loans', 'all'],
      '/reports': ['view_reports', 'generate_reports', 'all'],
      '/users': ['manage_users', 'all'],
      '/roles': ['manage_roles', 'all'],
      '/settings': ['manage_own_profile', 'system_settings', 'all']
    };

    const requiredPermissions = pagePermissions[page] || [];
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    addUser,
    updateUser,
    deleteUser,
    addRole,
    updateRole,
    deleteRole,
    hasPermission,
    hasRole,
    canAccessPage
  };

  return (
    <AuthContext.Provider value={value}>
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