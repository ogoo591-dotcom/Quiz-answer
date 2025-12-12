"use client";

export const Header = () => {
  return (
    <div className="h-20 w-full flex flex-wrap bg-gray-50 border-b justify-between items-center">
      <h1 className="font-bold ml-10 text-2xl text-black">Quiz app</h1>
      <img
        src={"/Zurag.jpg"}
        className="h-11 w-11 rounded-full border-none mr-8"
      />
    </div>
  );
};
