import type { Metadata } from "next";
import { AuthSplit } from "@/components/account/auth";
import { SignInForm } from "./sign-in-client";

export const metadata: Metadata = { title: "Sign in" };

export default function SignIn() {
  return (
    <AuthSplit>
      <SignInForm />
    </AuthSplit>
  );
}
