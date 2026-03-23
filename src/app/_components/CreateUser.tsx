"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export const CreateUser = () => {
  const { user } = useUser();

  const createUser = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    const clerkId = user?.id;
    if (!email || !clerkId) return;

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.fullName,
          email,
          clerkId,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) createUser();
  }, [user]);

  return <></>;
};
