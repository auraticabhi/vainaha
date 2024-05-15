import { cn } from "@/lib/utils"
import { Button } from "../../../components/ui/button"
import { ScrollArea } from "../../../components/ui/scroll-area"

import { Playlist } from "../data/playlists"
import { current } from "@reduxjs/toolkit"
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase"
import { collection, getDocs } from "firebase/firestore"
import Loader from "@/components/ui/Loader"
import { setCategoryE, categoryE, change, setChange } from "@/store/slice";
import { useSelector } from "react-redux"
import { store } from "@/store/store"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  playlists: Playlist[],
  selectChange: Function,
  currentC: string
}

export function Sidebar({ className, playlists, selectChange, currentC }: SidebarProps) {

  const [sidebarCategory, setSidebarCategory] = useState<any>();
  const categoryEvents = useSelector(categoryE);
  const changeE = useSelector(change);

  useEffect(()=>{
    selectChange(categoryEvents);
  }, [changeE])

  useEffect(()=>{
    const getCat=async()=>{
      try {
        const eventCategoriesRef = collection(db, 'meta-data', 'v1', 'event-categories');
        const snapshot = await getDocs(eventCategoriesRef);
    
        const eventCategories:any = [];
        snapshot.forEach(doc => {
          eventCategories.push({ id: doc.id, ...doc.data() });
        });
    
        return eventCategories;
      } catch (error) {
        console.error('Error fetching event categories:', error);
        return [];
      }
  }
  const category = getCat().then(categories => {
    setSidebarCategory(categories);
  }).catch(error => {
    console.error('Error:', error);
  });
  }, [])

  //console.log("LS: ", selectChange);
  return (
    <div>
    <div className={cn(" dark:bg-[#262626] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]", className)}>
      <div className="space-y-4 pt-4 pb-2">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-4 text-[20px] font-[500] tracking-tight">
            Discover
          </h2>
          <ScrollArea className="h-[320px] px-1">
          <div className="space-y-1">
            <Button onClick={()=>{selectChange("all")}} variant={`${currentC=="all"?"secondary":"ghost"}`} className="w-full justify-start text-[15px]">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg> */}
              All
            </Button>
            <div>
              {
                sidebarCategory?
                sidebarCategory.map((categoryD:any, index:any)=>(
                  <div key={index}>
                    <Button onClick={()=>{selectChange(categoryD.id)}} variant={`${currentC==categoryD.id.split("|").join("/")?"secondary":"ghost"}`} className="w-full justify-start text-[15px]">
                      {categoryD.id.split("|").join("/")}
                    </Button>
                  </div>
                )):
                <div><Loader/></div>
              }
            </div>
            {/* <Button onClick={()=>{selectChange("How To")}} variant={`${currentC=="How To"?"secondary":"ghost"}`} className="w-full justify-start">
              How To
            </Button>
            <Button onClick={()=>{selectChange("Help")}} variant={`${currentC=="Help"?"secondary":"ghost"}`} className="w-full justify-start">
              Help
            </Button>
            <Button onClick={()=>{selectChange("Mystery|Haunted|Ghost")}} variant={`${currentC=="Mystery/Haunted/Ghost"?"secondary":"ghost"}`} className="w-full justify-start">
            Mystery/Haunted/Ghost
            </Button>
            <Button onClick={()=>{selectChange("Astrology|Remedies|Occult")}} variant={`${currentC=="Astrology/Remedies/Occult"?"secondary":"ghost"}`} className="w-full justify-start">
            Astrology/Remedies/Occult
            </Button>
            <Button onClick={()=>{selectChange("GemStones|Rudraksha")}} variant={`${currentC=="GemStones/Rudraksha"?"secondary":"ghost"}`}className="w-full justify-start">
            GemStones/Rudraksha
            </Button> */}
          </div>
          </ScrollArea>
        </div>
      </div>
    </div>
    <div className={cn(" dark:bg-[#262626] mt-[14px] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]", className)}>
    <div className="space-y-4 pt-4 pb-2">
    <div className="py-1 mt-1">
          <h2 className="relative px-7 text-[20px] tracking-tight font-[500]">
            Playlists
          </h2>
          <ScrollArea className="h-[150px] px-1">
            <div className="space-y-1 p-2">
              {playlists?.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="w-full justify-start text-[15px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        </div>
        </div>
    </div>
  )
}