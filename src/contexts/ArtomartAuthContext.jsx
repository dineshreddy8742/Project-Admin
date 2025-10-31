import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        // First try to get existing profile - use maybeSingle() to avoid errors when no profile exists
        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.maybeSingle()
        if (!error) {
          setUserProfile(data) // data will be null if no profile exists, which is fine
        } else {
          console.error('Profile fetch error:', error)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Profile load error:', error)
        setUserProfile(null)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        profileOperations?.load(session?.user?.id) // Fire-and-forget
      } else {
        profileOperations?.clear()
      }
    }
  }

  useEffect(() => {
    // Initial session check
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Enhanced auth methods
  const signIn = async (email, password) => {
    // Validate inputs before making the request
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } }
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return { error: { message: 'Email and password must be strings' } }
    }

    if (email.trim() === '' || password.trim() === '') {
      return { error: { message: 'Email and password cannot be empty' } }
    }

    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      // Log detailed error for debugging
      if (error) {
        console.error('Supabase auth error:', JSON.stringify(error, null, 2))
      }

      return { data, error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      // If signup successful and we have user data, create profile
      if (!error && data?.user && userData) {
        try {
          const profileData = {
            id: data.user.id,
            role: userData.role || 'farmer',
            full_name: userData.name || userData.full_name || '',
            phone: userData.phone || '',
            state: userData.state || '',
            district: userData.district || '',
            language: userData.language || 'en',
            plan: userData.plan || 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error: profileError } = await supabase?.from('user_profiles')?.insert(profileData)
          if (profileError) {
            console.error('Profile creation error:', JSON.stringify(profileError, null, 2))
            // Don't fail the signup if profile creation fails
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError)
        }
      }

      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const register = async (name, email, password, role) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            full_name: name
          }
        }
      })
      if (error) {
        console.error('Registration error:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
      }
      return { error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email)
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }

    try {
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.maybeSingle()

      if (fetchError) {
        console.error('Profile fetch error during update:', fetchError)
        return { error: { message: 'Failed to check existing profile' } }
      }

      let result
      if (existingProfile) {
        // Profile exists, update it
        result = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date().toISOString()
        })?.eq('id', user?.id)?.select()?.single()
      } else {
        // Profile doesn't exist, create it
        const profileData = {
          id: user.id,
          email: user.email,
          role: updates.role || 'farmer',
          full_name: updates.name || user.user_metadata?.name || user.user_metadata?.full_name || '',
          phone: updates.phone || '',
          state: updates.state || '',
          district: updates.district || '',
          language: updates.language || 'en',
          plan: updates.plan || 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        }
        result = await supabase?.from('user_profiles')?.insert(profileData)?.select()?.single()
      }

      if (!result?.error) {
        setUserProfile(result.data)
        return { data: result.data, error: null }
      } else {
        console.error('Profile update/create error:', JSON.stringify(result.error, null, 2))
        return { error: result.error }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  // Handle Google OAuth redirect with role
  React.useEffect(() => {
    const handleGoogleRedirect = async () => {
      const storedRole = localStorage.getItem('selectedRole');
      if (storedRole && user) {
        // Update profile with selected role for Google OAuth
        await updateProfile({ role: storedRole });
        localStorage.removeItem('selectedRole');
      }
    };

    handleGoogleRedirect();
  }, [user, userProfile]);

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile,
    register,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}