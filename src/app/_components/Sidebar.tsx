"use client";

import { HistoryItem } from "./HIstoryItem";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

const historyList = [
  "Genghis Khan",
  "Figma ашиглах заавар",
  "Санхүүгийн шийдлүүд",
  "Figma-л загвар зохион бүтээх аргачлалууд",
  "Санхүүгийн технологи 2023",
  "Хэрэглэгчийн интерфейс дизайны шилдэг туршлага",
  "Архитектур загварчлалын хөтөлбөрүүд",
  "Эрүүл амьдралын хэв маяг",
  "Технологийн салбарт хийгдэх буй инноваци",
];

export const SideBarComponent = () => {
  return (
    <Sidebar className="pt-18 border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black text-xl">
            History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {historyList.map((item, i) => (
                <HistoryItem key={i} title={item} />
              ))}{" "}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
