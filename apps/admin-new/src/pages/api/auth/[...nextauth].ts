// NOTE: remove the line below before editing this file
/* eslint-disable */
import { LOGIN_USER } from "@/graphql/user.gql";
import { instance } from "@/lib/axios";
import { client } from "@/lib/graphql";
import { useMutation } from "@apollo/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getSession } from "next-auth/react";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { data, errors } = await client.mutate({
            mutation: LOGIN_USER,
            variables: {
              email: credentials?.email,
              password: credentials?.password,
            },
          });
          console.log("🚀 ~ authorize: ~ errors:", data);

          if (errors || !data || !data.login) {
            throw new Error(
              errors?.[0]?.message || "Invalid login credentials",
            );
          }

          const { accessToken, user } = data.login;

          if (!accessToken || user.role !== "ADMIN") {
            throw new Error("Unauthorized");
          }

          return {
            id: user.id,
            accessToken,
            email: user.email,
            role: user.role,
            user,
          };
        } catch (error) {
          // Extract the first GraphQL error message if available
          const errorMessage =
            (error as any).graphQLErrors?.[0]?.message ||
            "Invalid login credentials";

          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.email = user.user.email;
        token.id = user.user.id;
        token.name = user.user.name;
        token.slug = user.user.slug;
        token.role = user.role_name;
        token.status = user.user.status;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.email = token.email;
      session.id = token.id;
      session.name = token.name;
      session.slug = token.slug;
      session.role = token.role;
      session.status = token.status;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
});
