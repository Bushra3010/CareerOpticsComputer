"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { viewForRole, type View } from "@/lib/roles";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id?: string;
  branch_id?: string;
};

type Auth = {
  user: User | null;
  profile: UserProfile | null;
  view: View;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const Context = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        // Fetch profile
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (mounted && data) {
          setProfile(data as UserProfile);
        }
      }
      setIsLoading(false);
    };

    void getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (mounted && data) {
            setProfile(data as UserProfile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (identifier: string, password: string) => {
    // Try email first, then fall back to finding by username in profiles
    let email = identifier;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      // Look up email from profiles by username
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();
      const profileEmail = (profileData as { email?: string } | null)?.email;
      if (profileEmail) {
        email = profileEmail;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid credentials");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const view = viewForRole(profile?.role);

  return (
    <Context.Provider value={{ user, profile, view, login, logout, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider missing");
  return value;
};
