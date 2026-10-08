import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ProfileContextType {
  isProfileOpen: boolean;
  originatingPath: string;
  toggleProfile: () => void;
  openProfile: () => void;
  closeProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(
    location.pathname === "/profile"
  );

  // Track the originating path (URL path + search + hash) before opening profile
  const originatingPathRef = useRef<string>(
    location.pathname !== "/profile"
      ? location.pathname + location.search + location.hash
      : "/"
  );

  // Track the background location object so <Outlet /> stays mounted on the originating page
  const backgroundLocationRef = useRef<any>(null);

  useEffect(() => {
    if (location.pathname !== "/profile") {
      originatingPathRef.current = location.pathname + location.search + location.hash;
      backgroundLocationRef.current = location;
      setIsProfileOpen(false);
    } else {
      setIsProfileOpen(true);
    }
  }, [location.pathname, location.search, location.hash]);

  const openProfile = () => {
    if (location.pathname !== "/profile") {
      const currentFull = location.pathname + location.search + location.hash;
      originatingPathRef.current = currentFull;
      backgroundLocationRef.current = location;
      setIsProfileOpen(true);
      navigate("/profile", {
        state: {
          backgroundLocation: location,
          originatingPath: currentFull
        }
      });
    } else {
      setIsProfileOpen(true);
    }
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    const targetPath =
      originatingPathRef.current && originatingPathRef.current !== "/profile"
        ? originatingPathRef.current
        : "/";

    if (location.pathname === "/profile") {
      navigate(targetPath, { replace: true });
    }
  };

  const toggleProfile = () => {
    if (isProfileOpen || location.pathname === "/profile") {
      closeProfile();
    } else {
      openProfile();
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        isProfileOpen,
        originatingPath: originatingPathRef.current,
        toggleProfile,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
