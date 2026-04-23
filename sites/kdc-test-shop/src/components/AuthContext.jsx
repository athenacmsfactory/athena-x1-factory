import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    auth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    db,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from '../lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch profile data from customers collection
                const profileRef = doc(db, "customers", currentUser.email);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setUserProfile(profileSnap.data());
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, displayName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial customer record
        const customerRef = doc(db, "customers", email);
        await setDoc(customerRef, {
            naam: displayName,
            email: email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        userProfile,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
