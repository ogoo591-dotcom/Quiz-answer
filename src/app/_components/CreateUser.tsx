"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export const CreateUser = () => {
  const { user } = useUser();

  const createUser = async () => {
    try {
      await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          clerkId: user?.id,
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
