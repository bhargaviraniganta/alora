
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { firebaseAuthService, User } from "@/services/firebase";
import { registerVisitor } from "@/services/analyticsService";
//import { trackVisitor } from "@/services/analyticsService";




interface AuthState {
 user: User | null;
 isAuthenticated: boolean;
 isLoading: boolean;
}


interface AuthContextType extends AuthState {
 login: (email: string, password: string) => Promise<void>;
 signup: (email: string, password: string) => Promise<void>;
 logout: () => Promise<void>;
 forgotPassword: (email: string) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children,}) => {
 const [state, setState] = useState<AuthState>({
   user: null,
   isAuthenticated: false,
   isLoading: true,
 });


useEffect(() => {
 const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
   // ✅ Update UI FIRST (never block render)
   setState({
     user,
     isAuthenticated: !!user,
     isLoading: false,
   });
   if (user?.uid) {
          try {
            await registerVisitor(user.uid,user.email || undefined);
          } catch (e) {
            console.error("Visitor tracking failed", e);
          }
        }
 });
 return () => unsubscribe();
}, []);








 const login = useCallback(async (email: string, password: string) => {
   const user = await firebaseAuthService.login(email, password);
   // State will be updated by onAuthStateChanged listener
 }, []);


 const signup = useCallback(async (email: string, password: string) => {
   const user = await firebaseAuthService.signup(email, password);
   // State will be updated by onAuthStateChanged listener

 }, []);


 const logout = useCallback(async () => {
   await firebaseAuthService.logout();
   // State will be updated by onAuthStateChanged listener
 }, []);


 const forgotPassword = useCallback(async (email: string) => {
   await firebaseAuthService.sendPasswordReset(email);
 }, []);


 return (
   <AuthContext.Provider
     value={{
       ...state,
       login,
       signup,
       logout,
       forgotPassword,
     }}
   >
     {children}
   </AuthContext.Provider>
 );
};


export const useAuth = (): AuthContextType => {
 const context = useContext(AuthContext);
 if (context === undefined) {
   throw new Error("useAuth must be used within an AuthProvider");
 }
 return context;
};
