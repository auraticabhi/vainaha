"use client";

import React, { useState, useRef, useEffect } from "react";

import parse from "html-react-parser";

import { MessageSquare } from "lucide-react";
import { Share } from "lucide-react";
import { Bookmark } from "lucide-react";
import ShareDialog from "./ShareDialog";
// import { Trash2 } from "lucide-react";
import { AiTwotoneDelete } from "react-icons/ai";
import { RiUserFollowLine } from "react-icons/ri";

import Link from "next/link";
import Image from "next/image";

import PostVoteClient from "./post-vote/PostVoteClient";
import PostVoteClientPhone from "./post-vote/PostVoteClientPhone";
import { Avatar, AvatarFallback } from "./ui/avatar";

import { formatTimeToNow } from "@/lib/date";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

import { arrayRemove, arrayUnion, doc, updateDoc , getDoc, onSnapshot } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type Props = {
  post: {
    id: string;
  name: string;
  description: string;
  profilePic: string;
  answerImageURL: any;
  voteAmt: number;
  //shares: number;
  //comments: number;
  questionId: string;
  questionTitle: string;
  createdAt: string;
  anonymity: boolean;
  uid: string
    // ansNumbers: number
  };
  // children: Element
  // id: string
  isProfile?: boolean;
  handleDelete?: Function;
};

const Post = ({ post, isProfile = false, handleDelete = () => {} }: Props) => {
  const pRef = useRef<HTMLDivElement>(null);

  //console.log("Answer Posr: ", post);
  const { toast } = useToast();

  const isAnonymous = post.anonymity;

  //for displaying 'more' button
  const [isExpanded , setIsExpanded] = useState(false);
  const [isOverflowing , setIsOverflowing] = useState(false);

  //needed to send it to PostVoteClientPhone so that it can get the current user's vote
  const [user, loading] = useAuthState(auth);

  //saving the post funcitonality
  const [savedState, setSavedState] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false); // State to track if the user is following this post's creator
  const [isCurrentUser, setIsCurrentUser] = useState(false); // State to track if the post's creator is the current user

  
  const HandleDelete = () => {
    handleDelete(post.id);
  };

//   const handleSave = async () => {
//     if (!user||user.isAnonymous==true) {
//       toast({
//         title: " Please sign in to save posts ",
//         variant: "destructive",
//       });
//       return;
//     }

//     const userRef = doc(db, "users", user.uid);

//     if (savedState) {
//       //post is currently saved remove it from saved posts
//       await updateDoc(userRef, {
//         savedPosts: arrayRemove(post.id),
//       });
//       toast({
//         title: " Post removed from saved ",
//         variant: "default",
//       });
//     } else {
//       //post is currently not saved add it to saved posts
//       await updateDoc(userRef, {
//         savedPosts: arrayUnion(post.id),
//       });
//       toast({
//         title: " Post saved ",
//         variant: "default",
//       });
//     }

//     setSavedState(!savedState);
//   };

//   useEffect(() => {
//     // Check if the current user is following the post's creator
//     if (user) {
//       const userRef = doc(db, "users", user.uid);
//       const unsubscribe = onSnapshot(userRef, (doc) => {
//         if (doc.exists()) {
//           const userData = doc.data();
//           setIsFollowing(userData.following.includes(post.uid)); // Update isFollowing based on the following list
//           setIsCurrentUser(user.uid === post.uid); // Check if the post's creator is the current user
//         }
//       });

//       return () => unsubscribe();
//     }
//   }, [post.uid, user]);

  //fetching savedPosts from user's document
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!user) return;
//       const userRef = doc(db, "users", user.uid);
//       const userDoc = await getDoc(userRef);

//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         const savedPosts = userData.savedPosts;

//         // If the post is in the savedPosts array, set savedState to true
//         if (savedPosts.includes(post.id)) {
//           setSavedState(true);
//         } else {
//           // If the post is not in the savedPosts array, set savedState to false
//           // unless it's the recently saved post (post.id === savedPostId)
//           // setSavedState(post.id === savedPostId);
//         }
//       }
//     };

//     fetchUser();
//   }, [post.id, user]);

  //for displaying 'more' button
//   useEffect(() => {
//     // Assuming a line height of around 20px
//     const maxHeight = 25 * 3; 
  
//     if (pRef.current && pRef.current.offsetHeight > maxHeight) {
//       setIsOverflowing(true);
//     } else {
//       setIsOverflowing(false);
//     }
//   }, [post.description]);

  //console.log("Id: ", post.uid, " ",  post.title);

//   const handleFollow = async () => {
//     if (!user||(user&&user.isAnonymous==true)) {
//       toast({
//         title: " Please login to follow others ",
//         variant: "destructive",
//       });
//       return;
//     }

//     const userRef = doc(db, "users", user.uid);

//     try {
//       await updateDoc(userRef, {
//         following: isFollowing
//           ? arrayRemove(post.uid) // Unfollow if already following
//           : arrayUnion(post.uid), // Follow if not following
//       });

//       setIsFollowing(!isFollowing); // Update isFollowing state

//       // Update followers list of the post's creator
//       const postUserRef = doc(db, "users", post.uid);
//       await updateDoc(postUserRef, {
//         followers: isFollowing
//           ? arrayRemove(user.uid) // Remove follower if unfollowing
//           : arrayUnion(user.uid), // Add follower if following
//       });

//       // Show toast notification based on follow/unfollow action
//       toast({
//         title: isFollowing ? "You have unfollowed this user ❌" : "You are now following this user ✅",
//         variant: "default",
//       });

//     } catch (error) {
//       console.error("Error updating following list:", error);
//       toast({
//         title: "Error updating following list",
//         variant: "destructive",
//       });
//     }
//   };


  return (
    <div className="rounded-md bg-white dark:bg-[#262626] shadow my-1">
      <div className="px-6 py-4 flex justify-between">
        {/* <PostVoteClient
        //   postId={post.id}
        //   initialVotesAmt={_votesAmt}
        //   initialVote={_currentVote?.type}
        /> */}

        {/* <PostVoteClientPhone/> */}

        <div className="w-0 flex-1 break-normal overflow-hidden">

          {!isProfile&&
          <div className="flex max-h-40 mt-1 space-x-2 text-xs text-gray-500">

            {/* <div> */}
            <Avatar>
              <div className=" relative w-full h-full aspect-square">
                <Image
                  fill
                  src={
                    isAnonymous
                      ? "https://e7.pngegg.com/pngimages/416/62/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png"
                      : post.profilePic
                  }
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                />
              </div>
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            {/* </div> */}
            {/* <Separator orientation="vertical" className=" h-5 mt-4 " /> */}
            <div className=" flex space-x-2">
            <span className=" mt-3 text-sm font-semibold text-[#0c0c0c] dark:text-yellow-50 font-dmsans">
              {isAnonymous ? "Anonymous" : post.name}
            </span>{" "}
            {isAnonymous||isCurrentUser || !user ? null : (
              <div className=" flex space-x-1 mr-5 ">
                <svg
                  viewBox="0 0 48 48"
                  className=" mt-[1.20rem] mr-1 w-1 h-1"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M24 36C30.6274 36 36 30.6274 36 24C36 17.3725 30.6274 12 24 12C17.3726 12 12 17.3725 12 24C12 30.6274 17.3726 36 24 36Z"
                      fill="#333333"
                    ></path>{" "}
                  </g>
                </svg>


                {/* {(
        <button className=" text-blue-500 font-dmsans text-xs mt-[0.33rem] p-0 hover:underline cursor-pointer" onClick={handleFollow}>
          {isFollowing ? "Following" : "Follow"}
        </button>
      )} */}
              </div>
            )}
            </div>
            {/* {formatTimeToNow(new Date(post.createdAt))} */}
          </div>
          }
          
          {/* <div className={`${post.title?"":"hidden"}`}>
          <Link href={`/${encodeURIComponent(post?.title?.split(" ").join("-"))}`}>
            <h1 className={`font-bold font-dmsans py-2 leading-6 text-[17px] text-[#282829] dark:text-white ${isExpanded ? 'hover:underline' : ''}`}>
              {post.title}
            </h1>
          </Link>
          </div> */}

          {/* <p className="mb-1">{parse(post.description)}</p> */}
          {post.answerImageURL ? (
            <div className="relative w-full h-60">
              <Image
                src={post.answerImageURL}
                layout="fill"
                objectFit="cover"
                alt="post image"
              />
            </div>
          ) : null}

          <div
            className={`relative text-sm max-h-20 w-full overflow-clip ${isExpanded ? 'max-h-none': '' }`}
            ref={pRef}
          >
            {/* <EditorOutput content={post.content} /> */}
            <Link
            href={`/${post?.questionTitle?.split(" ").join("-")}`}
            className="w-fit flex items-center gap-2"
          >
            <p className="text-[#282829] font-dmsans dark:text-white text-base/[21px] text-[15px]">{parse(post.description)}</p>
            </Link>
            {/* {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              
            ) : null} */}
            {/* {!isExpanded && isOverflowing && (
              <div className="absolute bottom-0 md:bottom-[-0.16rem] left-0 w-full  text-right ">
                <button className=" text-blue-500  hover:underline md:w-[8%] w-full backdrop-blur-none bg-white/50 dark:bg-transparent  text-right text-sm  " onClick={() => setIsExpanded(true)}>(more)</button>
              </div>
            )} */}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-b-md dark:bg-[#1A1A1B]/65 z-20 border border-t-gray-150 flex justify-between  gap-x-3 text-sm px-4 py-2  sm:px-6">
        {/* <div className=' sm:block md:hidden '> */}
        <PostVoteClientPhone
          postId={post.id}
          postType="answers"
          userId={user?.uid!}
          questionId={post.questionId}
        />
        {/* </div> */}

        <div className=" flex gap-x-3">
          <Link
            href={`/${post?.questionTitle?.split(" ").join("-")}`}
            className="w-fit flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />{" "}
            <span className=" sm:block hidden font-dmsans">Comment</span>
          </Link>
          <button className="w-fit flex items-center gap-2 font-dmsans">
            <ShareDialog
              postLink={`/${encodeURIComponent(post?.questionTitle?.split(" ").join("-"))}`}
            />
          </button>
          {/* <button
            className="w-fit flex items-center gap-2"
            onClick={handleSave}
          >
            <Bookmark
              className={cn("h-4 w-4", {
                " text-black fill-black": savedState == true,
              })}
            />{" "}
            {savedState ? (
              <span className=" sm:block hidden font-dmsans">Saved</span>
            ) : (
              <span className=" sm:block hidden font-dmsans">Save</span>
            )}
          </button> */}

          {isProfile&&
          <AlertDialog>
          <AlertDialogTrigger asChild>
          <button
            className="w-fit flex items-center gap-2"
          >
            <AiTwotoneDelete className='text-xl' />{" "}
          </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                post and remove the data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={HandleDelete} >Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
          }

        </div>
      </div>
    </div>
  );
};

export default Post;
