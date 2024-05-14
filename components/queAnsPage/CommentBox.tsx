"use client";

import React, { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentType } from "@/schemas/comment";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  onSnapshot,
  orderBy,
  doc as docc,
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";

type Input = z.infer<typeof CommentType>;

type Props = {
  postTitleWithSpaces: string;
  changeHandler: Function;
  answerId: string;
  toggleCommentInputVisibility: () => void;
};

type CommentType = {
  // id: string;
  comment: string;
  name: string;
  profilePic: string;
  createdAt: string;
  replies: ReplyType[];
};

type ReplyType = {
  // id: string;
  reply: string;
  name: string;
  profilePic: string;
  createdAt: string;
};

type CommentTypeWithId = CommentType & { id: string };

const CommentBox = ({
  postTitleWithSpaces,
  changeHandler,
  answerId,
  toggleCommentInputVisibility,
}: Props) => {
  const [user, loading] = useAuthState(auth);

  const [comments, setComments] = useState<CommentTypeWithId[]>([]);
  const [replies, setReplies] = useState<string[]>(comments.map(() => ""));

  const form = useForm<Input>({
    resolver: zodResolver(CommentType),
    defaultValues: {
      comment: "",
    },
  });

  async function createCommentPost(data: Input) {
    //fetch the question document is the first part
    const queRef = collection(db, "questions");
    const q = query(queRef, where("title", "==", postTitleWithSpaces));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]; // Get the first (and should be only) document that matches the query

      // Use the id of the question document and the answerId to create the comment post in the 'comments' subcollection
      const docRef = await addDoc(
        collection(db, "answers", answerId, "comments"),
        {
          comment: data.comment,
          uid: user?.uid,
          name: user?.displayName,
          profilePic: user?.photoURL,
          createdAt: serverTimestamp(),
          questionId: doc.id, 
          answerId: answerId
        }
      );

      const quessId = doc.id
      //console.log("Comment que ", quessId);

      // try {
      //   console.log("keyword Gen.....")
      //   const docRef = await addDoc(collection(db, 'keywords'), {
      //     prompt: `Generate some keywords and hashtags on topic ${data.comment}`,
      //   });
      //   console.log('Keyword Document written with ID: ', docRef.id);
    
      //   // Listen for changes to the document
      //   const unsubscribe = onSnapshot(docc(db, 'keywords', docRef.id), async(snap) => {
      //     const data = snap.data();
      //     if (data && data.response) {
      //       console.log('RESPONSE: ' + data.response);
      //       const keywordsString = `${data.response}`;
  
      //       const questionDocRef = docc(db, 'questions', quessId);
      //       await updateDoc(questionDocRef, {
      //       commentKeywords: keywordsString, // Add your keywords here
      //   });
      //     }
      //   });
    
      //   // Stop listening after some time (for demonstration purposes)
      //   setTimeout(() => unsubscribe(), 60000);
      // } catch (error) {
      //   console.error('Error adding document: ', error);
      // }

      console.log("Comment written with : ", docRef);

      form.reset();
      changeHandler((prev: boolean)=>!prev)
    } else {
      console.log("No such document");
    }
  }

  const onSubmit = (data: Input) => {
    console.log(data);
    console.log(postTitleWithSpaces);

    createCommentPost(data);

  };

  const [name, setName] = useState<string>(user?.displayName||"loading...");

  useEffect(() => {
    const fetchFollowersAndFollowing = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const following = userData?.following?.length;
          const followers = userData?.followers?.length;
          const realName = userData?.name;
          // Assuming followers and following fields exist in user data
          setName(realName);
          // setFollowersCount(followers || 0);
          // setFollowingCount(following || 0);
        }
      }
    };

    fetchFollowersAndFollowing();
  }, [user?.uid]);


  //fetching all the comments
  useEffect(() => {
    const fetchComments = async () => {
      const queRef = collection(db, "questions");
      const q = query(queRef, where("title", "==", postTitleWithSpaces));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];

        // Listener for the comments
        const commentsRef = collection(
          db,
          "answers",
          answerId,
          "comments"
        );
        const qComments = query(commentsRef, orderBy("createdAt", "desc"));
        const commentsUnsub = onSnapshot(qComments, (snapshot) => {
          const comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as CommentType),
          }));

          setComments(comments as CommentTypeWithId[]);
        });

        // Cleanup function to unsubscribe from the listeners when the component unmounts
        return () => {
          commentsUnsub();
        };
      } else {
        console.log("No such document!");
      }
    };

    fetchComments();
  }, [postTitleWithSpaces, answerId]);

  //for displaying the reply input

  const [replyIndex, setReplyIndex] = useState<number | null>(null);

  const toggleReplyInputVisibility = (index: number) => {
    setReplyIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  //sending the reply back to the database
  async function submitReply(index: number) {
    const commentId = comments[index].id;
    const replyText = replies[index];

    if (!replyText) {
      console.log("Reply text is empty");
      return;
    }

    const reply: ReplyType = {
      reply: replyText,
      name: name||user?.displayName || "",
      profilePic: user?.photoURL || "",
      createdAt: serverTimestamp().toString(),
    };

    // Get the actual ID of the question document
    const queRef = collection(db, "questions");
    const q = query(queRef, where("title", "==", postTitleWithSpaces));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const questionDoc = snapshot.docs[0]; // Get the first (and should be only) document that matches the query
      const questionId = questionDoc.id; // Get the actual ID of the question document

      
      // Use the actual ID of the question document to construct the comment document reference
      const commentRef = docc(db, `answers/${answerId}/comments/${commentId}`);
      const commentSnapshot = await getDoc(commentRef);

      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data() as CommentType;
        const updateReplies = [...(commentData.replies || []), reply];

        await updateDoc(commentRef, {
          replies: updateReplies,
        });

        console.log("Reply added successfully");
      } else {
        console.log("No such document");
      }

      // Clear the reply text
      const newReplies = [...replies];
      newReplies[index] = "";
      setReplies(newReplies);
    } else {
      console.log("No such question document!");
    }
  }

  return (
    <div className=" border border-gray-300 pt-4 font-dmsans">
      <Form {...form}>
        <form
          className="relative flex gap-1 overflow-hidden p-1 px-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className=" w-full">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Add a comment ..."
                    autoComplete="off"
                    className="w-[99%] border-0 rounded-3xl  bg-slate-100 dark:bg-[#181818] p-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=" flex items-end justify-end ">
            {/* <Button
              variant="outline"
              onClick={toggleCommentInputVisibility}
              className=" rounded-3xl"
            >
              Cancel
            </Button> */}
            <Button type="submit" variant="outline" className=" rounded-3xl">
              Comment
            </Button>
          </div>
        </form>
      </Form>

      {/* displaying comments */}
      <div className=" mt-4">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className=" w-full  border border-gray-300  py-4 px-3"
          >
            <div className="flex  space-x-2">
              <Image
                src={comment.profilePic}
                alt="Profile Pic"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-semibold">{comment.name}</p>
                <p className="text-sm">{comment.comment}</p>
                <div>
                  <button
                    onClick={() => toggleReplyInputVisibility(index)}
                    className=" text-xs text-blue-500 hover:underline"
                  >
                    Reply
                  </button>

                  {/* displaying the reply input */}
                  {replyIndex === index && (
                    <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add your reply..."
                            className="w-full rounded-3xl border border-gray-300 p-2 mt-2"
                            value={replies[index] || ""}
                            onChange={(event) => {
                              const newReplies = [...replies];
                              newReplies[index] = event.target.value;
                              setReplies(newReplies);
                            }}
                          />
                          <button
                            className=" rounded-3xl border border-gray-300 p-2 mt-2"
                            onClick={() => submitReply(index)}
                          >
                            Send
                          </button>

                        </div>
                        
                        {/* displaying the replies */}
                        {comment.replies && comment.replies.sort((a:any, b:any) => b.createdAt - a.createdAt).map((reply, replyIndex) => (
                          <div key={replyIndex} className="flex space-x-2 mt-2 ml-2">
                            <Image
                            src={reply.profilePic}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full mt-1"
                            alt="Profile Pic"
                            />
                            <div>
                              <p className="text-sm font-semibold">{reply.name}</p>
                              <p className="text-sm">{reply.reply}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
