import Image from "next/image"
import { Bookmark, PlusCircleIcon } from "lucide-react"
import FImage from "../../../public/placeholder.jpg"

import parse from "html-react-parser";

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu"

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/components/ui/use-toast";

import { Album } from "../data/albums"
import { playlists } from "../data/playlists"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Timestamp, arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  album: Album
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
}

type Props = {
    post: {
      id: string;
      title: string;
      description: string;
      eventImageURL: string;
      dateOfEvent: Timestamp;
      locationOfEvent: string;
      durationOfEvent: number;
      registrationLink: string;
      uid: string;
      createdAt: string;
      category: Array<string>;
      name: string;
      profilePic: string;
    };
    // children: Element
    // id: string
    isProfile?: boolean;
    handleDelete?: Function;
  };

export function AlbumArtwork({ post, isProfile = false, handleDelete = () => {} }: Props) {

  const [savedState, setSavedState] = useState(false);
  const [user, loading] = useAuthState(auth);
  const {toast} = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const savedEvents = userData.savedEvents;

        // If the post is in the savedPosts array, set savedState to true
        if (savedEvents.includes(post.id)) {
          setSavedState(true);
        } else {
          // If the post is not in the savedPosts array, set savedState to false
          // unless it's the recently saved post (post.id === savedPostId)
          // setSavedState(post.id === savedPostId);
        }
      }
    };

    fetchUser();
  }, [post.id, user]);

  const handleSave = async () => {
    if (!user||user.isAnonymous==true) {
      toast({
        title: " Please sign in to save posts ",
        variant: "destructive",
      });
      return;
    }

    const userRef = doc(db, "users", user.uid);

    if (savedState) {
      //post is currently saved remove it from saved posts
      await updateDoc(userRef, {
        savedEvents: arrayRemove(post.id),
      });
      toast({
        title: " Event removed from saved ",
        variant: "default",
      });
    } else {
      //post is currently not saved add it to saved posts
      await updateDoc(userRef, {
        savedEvents: arrayUnion(post.id),
      });
      toast({
        title: " Event saved ",
        variant: "default",
      });
    }

    setSavedState(!savedState);
  };

  console.log(typeof post.dateOfEvent, post.dateOfEvent);


  let dateString;
    if (post.dateOfEvent) {
      let date;
      console.log('Type of post.dateOfEvent:', typeof post.dateOfEvent);
      console.log('Value of post.dateOfEvent:', post.dateOfEvent);
      if (typeof post.dateOfEvent === 'string') {
        date = new Date(post.dateOfEvent);
      } else if (typeof post.dateOfEvent === 'number') {
        date = new Date(post.dateOfEvent * 1000); // Multiply by 1000 if your timestamp is in seconds
      } else if (post.dateOfEvent.toDate !== undefined) {
        date = post.dateOfEvent.toDate();
      } else {
        console.error('post.dateOfEvent is neither a string, a number, nor a Timestamp');
        // Handle this case as appropriate for your application
      }
      if (date) {
        dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    }



  return (
    <div className="dark:bg-[#262626] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)] dark:hover:shadow-[#2f2e2e] hover:shadow-[0px_10px_1px_rgba(8,_112,_184,_0),_0_10px_20px_rgba(8,_112,_184,_0.5)] h-[290px] w-[20.9rem] pl-[0.45rem] bg-white rounded-md pt-1 transition-all duration-300">
    <div className="lg:w-[18.5rem] w-[full] lg:h-[8.1rem] h-[7.7rem]">
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md relative h-[12rem] w-[20rem]">
            {
            post.eventImageURL== null ?    
            <Image
              src={FImage}
              alt="QuestionImage"
              width={900}
              height={500}
              className={cn(
                "h-full w-full object-cover transition-all hover:scale-105",
              )}
            />:
            <Image
              src={post.eventImageURL}
              alt="QuestionImage"
              width={900}
              height={500}
              className={cn(
                "h-full w-full object-cover transition-all hover:scale-105",
              )}
            />
            }
            <div className='absolute bottom-[0.6rem] right-[0.1rem]'>
            <button
            className="w-fit flex items-center gap-2"
            onClick={handleSave}
          >
            <Bookmark
              className={cn("h-4 w-4 text-white", {
                " text-white fill-white": savedState == true,
              })}
            />{" "}
            {savedState ? (
              <span className=" sm:block hidden font-dmsans"></span>
            ) : (
              <span className=" sm:block hidden font-dmsans"></span>
            )}
          </button>
          </div>
          <div className="absolute bottom-[0.5rem] left-[0.5rem] z-10">
          {dateString && <div className="mt-[0.30rem] text-[14px] text-white font-[500]">{dateString}</div>}
          </div>
          <div className="absolute bottom-[0.4rem] left-[0.3rem] opacity-50">
          <div className="mt-[0.30rem] h-[1.5rem] w-[98px] bg-black rounded-md z-0"></div>
          </div>
          <div className="pt-[9px] absolute top-[0rem] left-[0.5rem]">
          {
            post?.category?.slice(0, 2).map((category, index)=>(
              <Button key={index} className='text-black bg-slate-100 text-sm hover:text-white rounded-3xl h-[1.4rem] mr-[0.4rem] px-2'>
                            {category.split("|").join("/")}
                            </Button>
            ))
}                 
        </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>Save Post</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Like</ContextMenuItem>
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="mt-3 text-sm">
      <Link href={`/event-details/${encodeURIComponent(post?.title?.split(" ").join("-"))}`}>
        <h3 className="text-[18px] font-[500] leading-none">{post.title.length>28?post.title.substring(0, 27)+"...":post.title}</h3>
      </Link>  
      {/* <div className="mt-[0.30rem] text-[14px] font-semibold opacity-85">{post.locationOfEvent}</div> */}
      <div className="hidden lg:block">
        {
        <p className="mt-[0.30rem] font-[400] overflow-hidden opacity-85 line-clamp-2 text-[18px]">{parse(`${post.description.length>90?post.description.substring(0, 89)+"...":post.description}`)}</p>
}
        </div>
      </div>
    </div>
    </div>
  )
}