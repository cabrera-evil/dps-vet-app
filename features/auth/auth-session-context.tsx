import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MockClient = {
  firstName: string;
  fullName: string;
  email: string;
};

export type MockSession = {
  client: MockClient;
};

export type MockLoginInput = {
  email: string;
  password: string;
};

type AuthSessionContextValue = {
  session: MockSession | null;
  signIn: (input: MockLoginInput) => Promise<void>;
  signOut: () => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const MOCK_CLIENT: MockClient = {
  firstName: "Diana",
  fullName: "Diana Cruz",
  email: "diana@ejemplo.com",
};

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null);

  const signIn = useCallback(
    async ({ email: _email, password: _password }: MockLoginInput) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 450));
      setSession({ client: MOCK_CLIENT });
    },
    [],
  );

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, signIn, signOut }),
    [session, signIn, signOut],
  );

  return <AuthSessionContext value={value}>{children}</AuthSessionContext>;
}

export function useAuthSession(): AuthSessionContextValue {
  const context = use(AuthSessionContext);
  if (!context)
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  return context;
}
