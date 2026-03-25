import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_URL = process.env.JSON_SERVER_URL;

if (!BASE_URL) {
  throw new Error("JSON_SERVER_URL environment variable is not set. Please configure it to point to the JSON server base URL.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const res = await fetch(`${BASE_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        })

        if (!res.ok) {
          throw new Error("Đăng nhập thất bại")
        }

        const data = await res.json()

        const user = data?.user || data

        if (!user || !user.id) {
          throw new Error("Email hoặc mật khẩu không đúng")
        }

        if (!user.isActive) {
          throw new Error("Tài khoản chưa kích hoạt")
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.fullName
        }
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
         // Persist the user's role in the JWT for use in the session callback
        ;(token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure session.user.id is populated from the JWT subject (user id)
        if (typeof token.sub === "string") {
          ;(session.user as any).id = token.sub
        }
        // Safely propagate role only if it exists and is a string
        if (typeof (token as any).role === "string") {
          ;(session.user as any).role = (token as any).role
        }
      }
      return session
    }
  },

  pages: {
    signIn: "/login"
  }
}
