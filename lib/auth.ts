import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // Remove adapter when using Credentials Provider
  // adapter: PrismaAdapter(prisma), // This conflicts with credentials provider
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.studentId
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && token.sub) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.studentId = token.studentId as string
      }
      return session
    }
  },
  events: {
    async signOut() {
      // Additional cleanup if needed
      console.log("User signed out")
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
}
