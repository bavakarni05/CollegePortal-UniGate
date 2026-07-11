import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Initialize state directly from localStorage to prevent flicker and ensure data persistence
  const [token, setToken] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth?.token || null;
    } catch { return null; }
  });

  const [user, setUser] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return auth?.user || null;
    } catch { return null; }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth?.user?.email) return [];
      const saved = localStorage.getItem(`wishlist_${auth.user.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [compareList, setCompareList] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth?.user?.email) return [];
      const saved = localStorage.getItem(`compareList_${auth.user.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const login = useCallback((auth) => {
    // auth: { token, user }
    if (!auth) return;
    const t = auth.token ?? auth;
    const u = auth.user ?? (auth.token ? null : auth);
    if (t) {
      setToken(t);
      localStorage.setItem('auth', JSON.stringify({ token: t, user: u }));
    }
    if (u) {
      setUser(u);
      // Hydrate lists for the logged-in user immediately from their specific storage key
      const savedWishlist = localStorage.getItem(`wishlist_${u.email}`);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      const savedCompare = localStorage.getItem(`compareList_${u.email}`);
      setCompareList(savedCompare ? JSON.parse(savedCompare) : []);
      
      showToast(`Welcome back, ${u.name}`,'success');
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setWishlist([]);
    setCompareList([]);
    localStorage.removeItem('auth');
    showToast('Logged out successfully','default');
  }, [showToast]);

  const authHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const toggleWishlist = useCallback((college) => {
    if (!user?.email) {
      showToast('Please login to use wishlist', 'error');
      return;
    }
    setWishlist(prev => {
      let newList;
      const exists = prev.some(item => item.id === college.id);
      if (exists) {
        showToast(`${college.name} removed from wishlist`, 'default');
        newList = prev.filter(item => item.id !== college.id);
      } else {
        showToast(`${college.name} added to wishlist`, 'success');
        newList = [...prev, college];
      }
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(newList));
      return newList;
    });
  }, [showToast, user]);

  const isWishlisted = useCallback((id) => wishlist.some(college => college.id === id), [wishlist]);

  const toggleCompare = useCallback((college) => {
    if (!user?.email) {
      showToast('Please login to compare colleges', 'error');
      return;
    }
    setCompareList(prev => {
      let newList;
      const exists = prev.some(item => item.id === college.id);
      if (exists) {
        showToast(`${college.name} removed from compare`, 'default');
        newList = prev.filter(item => item.id !== college.id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare up to 3 colleges', 'error');
          return prev;
        }
        showToast(`${college.name} added to compare`, 'success');
        newList = [...prev, college];
      }
      localStorage.setItem(`compareList_${user.email}`, JSON.stringify(newList));
      return newList;
    });
  }, [showToast, user]);

  const isInCompare = useCallback((id) => compareList.some(college => college.id === id), [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    if (user?.email) {
      localStorage.removeItem(`compareList_${user.email}`);
    }
    showToast('Comparison cleared','default');
  }, [showToast, user]);

  return (
    <AppContext.Provider value={{
      user,
      token,
      login,
      logout,
      authHeaders,
      wishlist,
      toggleWishlist,
      isWishlisted,
      compareList,
      toggleCompare,
      isInCompare,
      clearCompare,
      toast,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
