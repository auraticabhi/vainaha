import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { setCategoryQ, categoryQ } from "@/store/slice";
import { auth , storage } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

// import { Playlist } from "../data/playlists"

type Playlist = [
    "Recently Added",
  "Recently Played",
  "Top Songs",
  "Top Albums",
  "Top Artists",
  "Logic Discography",
  "Bedtime Beats",
  "Feeling Happy",
  "I miss Y2K Pop",
  "Runtober",
  "Mellow Days",
  "Eminem Essentials",
]

import { current } from "@reduxjs/toolkit"
import { use, useEffect, useState } from "react"
import { db } from "@/utils/firebase"
import { collection, getDocs } from "firebase/firestore"
import Loader from "@/components/ui/Loader"
import { setCategoryE, categoryE, change, setChange } from "@/store/slice";
import { useSelector, useDispatch } from "react-redux"
import { store } from "@/store/store"
import { PlusCircleIcon } from "lucide-react";
import { Separator } from "./ui/separator";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  playlists: Playlist[],
}

export function Sidebar({ className, playlists }: SidebarProps) {

  const sidebarCategory = ["Afterlife", "Astrology/Remedies/Occult", "Death", "Festivals", "GemStones/Rudraksha", "Help", "How to", "Meditation", "Miracles and Spirituality", "Mystery/Haunted/Ghost", "Mythology", "Religious Text", "Rituals", "Science and Religion", "Worship"]
  const categoryPosts = useSelector(categoryQ);
  const [user, loading] = useAuthState(auth);
  const dispatch = useDispatch();

  const selectChange = (category: any)=>{
      dispatch(setCategoryQ(category));
  }

  const [forums, setForums] = useState<any>([]);

    useEffect(() => {
        const fetchForums = async () => {
          try {
            const forumsCollection = collection(db, "forums");
            const forumsSnapshot = await getDocs(forumsCollection);
    
            const forumsData:any = [];
            forumsSnapshot.forEach((doc) => {
              // Assuming each forum document has fields like title, description, etc.
              const forumDetails = {
                uniqueForumName: doc.data().uniqueForumName,
                title: doc.data().name,
                description: doc.data().description,
                // Add other fields as needed
              };
              forumsData.push(forumDetails);
            });
    
            setForums(forumsData);
          } catch (error) {
            console.error("Error fetching forums:", error);
          }
        };
    
        fetchForums();
      }, []);

  return (
    <div>
    <div className={cn("pb-1 rounded-2xl sticky lg:top-[69px] max-h-[39rem] dark:bg-[#262626] bg-[#ffffff] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-4 text-lg font-bold tracking-tight">
            Categories
          </h2>
          <ScrollArea className="h-[320px] px-1">
          <div className="space-y-1">
            <Button onClick={()=>{selectChange("all")}} variant={`${categoryPosts=="all"?"secondary":"ghost"}`} className="w-full justify-start">
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
                    <Button onClick={()=>{selectChange(categoryD)}} variant={`${categoryPosts==categoryD?"secondary":"ghost"}`} className="w-full justify-start">
                      {categoryD}
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
        <Separator/>
      </div>
      <div className={cn("py-[14px] bt-1 border-black rounded-2xl bg-[#ffffff] dark:bg-[#262626] mt-[14px] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]", className)}>
          <h2 className="relative px-7 text-lg font-bold tracking-tight flex items-center justify-between">
            <span>Forums</span>
            <Link href="/createForum">
            <span><PlusCircleIcon/></span>
            </Link>
          </h2>
          <ScrollArea className="h-[150px] px-1">
            <div className="space-y-1 p-2">
            {
                forums?
                forums.map((forum:any, index:any)=>(
                  <div key={index}>
                    <div className="w-full justify-start px-4 py-2 text-base">
                    <Link href={`/forums/${forum.uniqueForumName}`}>
                      {forum.title}
                    </Link>  
                    </div>
                    <Separator/>
                  </div>
                )):
                <div><Loader/></div>
              }
            </div>
          </ScrollArea>
        </div>
      </div>
  )
}