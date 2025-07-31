"use client";

// Simple REST client for connecting to the trpc-app API
const API_BASE_URL = process.env.NEXT_PUBLIC_T3_API_URL || "http://localhost:3000";

export const api = {
  category: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/category.getAll`);
      return response.json();
    },
    getSmart: async () => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/category.getSmart`);
      return response.json();
    },
    create: async (data: { name: string; description?: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/category.create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: data }),
      });
      return response.json();
    },
    delete: async (data: { id: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/category.delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: data }),
      });
      return response.json();
    },
  },
  product: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/product.getAll`);
      return response.json();
    },
  },
  auth: {
    login: async (data: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/trpc/auth.login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: data }),
      });
      return response.json();
    },
  },
};
