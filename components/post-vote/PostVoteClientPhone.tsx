"use client";

import React, { useState, useEffect } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
import { useToast } from "../ui/use-toast";

import { doc, getDoc, setDoc, deleteDoc, onSnapshot , runTransaction , increment} from "firebase/firestore";
import { db } from "@/utils/firebase";

type Props = {
  postId: string;
  postType: "questions" | "answers" | "forumPosts";
  userId: string;
  questionId?: string;
};

const PostVoteClientPhone = ({
  postId,
  postType,
  questionId,
  userId,
}: Props) => {
  const [currentVote, setCurrentVote] = useState<"UP" | "DOWN" | null>(null);
  const [votesAmt, setVotesAmt] = useState<number>(0);
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();

  useEffect(() => {
    let docPath = `questions/${postId}`;

    if (postType === "answers") {
      if (!questionId) {
        console.error("questionId must be defined when postType is 'answers'");
        return;
      }
      docPath = `answers/${postId}`;
    }

    if(postType==="forumPosts"){
      docPath = `forumPosts/${postId}`;
    }

    // Fetch user's vote on mount
    const fetchUserVote = async () => {
      const docRef = doc(db, `${docPath}/votes/${userId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentVote(docSnap.data().value === 1 ? "UP" : "DOWN");
      }
    };

    fetchUserVote();

    // Listen for changes to voteAmt and update state
    const unsubscribe = onSnapshot(doc(db, docPath), (docSnap) => {
      if (docSnap.exists()) {
        setVotesAmt(docSnap.data().voteAmt);
      } else {
        // Handle the case where the document does not exist
        console.log(`No such document: ${docPath}`);
      }
    });

    return unsubscribe; // Unsubscribe on unmount
  }, [postId, postType, questionId, userId]);

  const vote = async (type: "UP" | "DOWN") => {
    
    if(!loading&&!user||user?.isAnonymous==true)
    {
      toast({
        title: " Please sign in to vote posts ",
        variant: "destructive",
      });
      return;
    }
    else{
    let docPath = `questions/${postId}`;
  
    if (postType === "answers") {
      if (!questionId) {
        console.error("questionId must be defined when postType is 'answers'");
        return;
      }
      docPath = `answers/${postId}`;
    }

    if(postType==="forumPosts"){
      docPath = `forumPosts/${postId}`;
    }
  
    const voteValue = type === "UP" ? 1 : -1;
    const voteRef = doc(db, `${docPath}/votes/${userId}`);
    const postRef = doc(db, docPath);
  
    await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteRef);
      const postSnap = await transaction.get(postRef);
  
      if (voteSnap.exists()) {
        // User is changing their vote or removing it
        const previousVoteValue = voteSnap.data().value;
  
        if (currentVote === type) {
          // User is removing their vote
          setCurrentVote(null);
          transaction.delete(voteRef);
          transaction.update(postRef, {
            voteAmt: increment(-voteValue),
          });
        } else {
          // User is changing their vote
          setCurrentVote(type);
          transaction.set(voteRef, { uid: userId, value: voteValue });
          transaction.update(postRef, {
            voteAmt: increment(voteValue - previousVoteValue),
          });
        }
      } else {
        // User is adding a new vote
        transaction.set(voteRef, { uid: userId, value: voteValue });
        setCurrentVote(type);
        transaction.update(postRef, {
          voteAmt: increment(voteValue),
        });
      }
    });
  }
  };
  

  return (
    <div className=" flex gap-1 border border-1 dark:border-zinc-400 border-zinc-400 rounded-3xl">
      {/* upvote */}
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="votingPhoen"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700 dark:text-white", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
        <p className=" text-sm text-zinc-500 ml-2 hover:text-zinc-700 font-dmsans">
          Support
        </p>
        {/* <Separator orientation="vertical" className=" h-7 my-1 ml-2 dark:text-zinc-400 text-zinc-500"/> */}
      </Button>

      {/* score */}
      <p className="text-center py-2 font-medium text-sm text-zinc-900 dark:text-white font-dmsans">
        {votesAmt||0}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        className={cn({
          "text-emerald-500": currentVote === "DOWN",
        })}
        variant="votingPhoen"
        aria-label="downvote"
      >
        <Separator
          orientation="vertical"
          className=" h-7 my-1 mr-2 dark:text-zinc-400"
        />
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700 dark:text-white", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClientPhone;