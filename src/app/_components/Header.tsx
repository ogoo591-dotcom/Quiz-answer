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
    <div className="w-full flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">Quiz app</h1>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="redirect">
            <button className="text-black font-medium">Sign in</button>
          </SignInButton>

          <SignUpButton mode="redirect">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
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
