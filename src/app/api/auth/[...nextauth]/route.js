import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/utils/mongodb';
import { compare } from 'bcrypt';
import { ObjectId } from 'mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("ecommerce");
          const user = await db.collection("users").findOne({ 
            username: credentials.username 
          });

          if (!user) {
            console.log("Auth: User not found");
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log("Auth: Invalid password");
            return null;
          }

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role 
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };