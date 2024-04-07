import type { Session, User } from "lucia";

export const useLucia = () => {
  const lucia = useState<{ user: User; session: Session } | null>(
    "lucia",
    () => null
  );
  return lucia;
};
