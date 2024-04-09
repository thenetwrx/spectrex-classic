import { verifyRequestOrigin } from "lucia";
import type { Session, User } from "lucia";
import { cryptr } from "../utils/auth";

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    const originHeader = getHeader(event, "Origin") ?? null;
    const hostHeader = getHeader(event, "Host") ?? null;
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return event.node.res.writeHead(403).end();
    }
  }

  try {
    const signedCookie = getCookie(event, lucia.sessionCookieName) ?? null;
    const sessionId = cryptr.decrypt(signedCookie!);

    if (!sessionId) throw Error();

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      appendResponseHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(cryptr.encrypt(session.id)).serialize()
      );
    }
    if (!session) {
      appendResponseHeader(
        event,
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
      );
    }

    event.context.session = session;
    event.context.user = user;
  } catch (err) {
    event.context.session = null;
    event.context.user = null;

    return;
  }
});

declare module "h3" {
  interface H3EventContext {
    user: User | null;
    session: Session | null;
  }
}
