"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Header() {
  return (
    <div className="h-full px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Quiz app</h1>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl="/">
            <button className="text-black font-medium">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium h-10 px-5">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
