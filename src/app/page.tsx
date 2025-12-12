import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideBarComponent } from "./_components/Sidebar";
import ArticleForm from "./_components/ArticleForm";
import { Header } from "./_components/Header";
import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log(users);

  return (
    <>
      <Header />
      <div className="h-screen w-full">
        <SidebarProvider>
          <SideBarComponent />
          <main>
            <SidebarTrigger />

            <div className="relative flex h-screen bg-[#f7f7f7]">
              <main className="flex-1 flex items-center justify-center w-screen">
                <ArticleForm />
              </main>
            </div>
          </main>
        </SidebarProvider>{" "}
      </div>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
        <h1 className="text-4xl font-bold mb-8  text-[#333333]">Superblog</h1>
        <ol className="list-decimal list-inside ">
          {users.map((user) => (
            <li key={user.id} className="mb-2">
              {user.email}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
