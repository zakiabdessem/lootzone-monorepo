"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function Page() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError("");
    
    try {
      await auth?.signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message?.includes("Invalid credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-6"
          >
            {error && (
              <div className="mb-4 text-sm font-medium text-red-500">
                {error}
              </div>
            )}
            <div className="flex w-full flex-col items-start gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your email"
                        className="w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Enter your password"
                        className="w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-4 flex w-full items-center justify-between">
                <Link
                  className="text-sm font-medium text-blue-500 hover:underline"
                  href={"/auth/reset"}
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
