import type { Metadata } from "next";
import { AuthSplit } from "@/components/account/auth";
import { SignUpForm } from "./sign-up-client";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUp() {
  return (
    <AuthSplit>
      <SignUpForm />
    </AuthSplit>
  );
}
