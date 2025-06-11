import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from "zustand/middleware";

// state type
type AuthData = { isAuthenticated: boolean, user: { firstName: string, lastName: string, dateOfBirth: string, accessCode: string } | null }

interface AuthState {
    auth: AuthData;

    // Actions
    setAuth: (data: AuthData) => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                // Initial state
                auth: {isAuthenticated: false, user: null},

                // Actions
                setAuth: (data) => set(() => ({auth: data}))


            }),
            {
                name: 'auth-data',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    auth: state.auth,
                })
            }
        )
    )
)

export default useAuthStore;
