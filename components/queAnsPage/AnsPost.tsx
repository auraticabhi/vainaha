"use client";

import React, { useRef , useState , useEffect} from "react";
import parse from "html-react-parser";

import { Key, MessageSquare } from "lucide-react";
import { Share } from "lucide-react";
import { Bookmark } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import PostVoteClient from "@/components/post-vote/PostVoteClient";
import CommentBox from "./CommentBox";
import PostVoteClientPhone from "../post-vote/PostVoteClientPhone";
import Loader from "../ui/Loader";
import { useToast } from "@/components/ui/use-toast";

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from "firebase/firestore";

type Props = {
  answers: {
    id: string;
    name: string;
    profilePic: string;
    // postImage: string;
    // title: string;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    answerImageURL: string;
    createdAt: string;
    anonymity: boolean;
  }[];
  postTitleWithSpaces: string;
  postId: string;
};

type AnswerType = {
  id: string;
  name: string;
  description: string;
  profilePic: string;
  // postImage: string;
  likes: number;
  comments: number;
  shares: number;
  answerImageURL: string;
  createdAt: string;
  anonymity: boolean;
  questionId: string;
  questionTitle: string;
  // Add any other fields as necessary
};

const AnsPost = ({answers , postTitleWithSpaces , postId }: Props) => {

  const { toast } = useToast();
  // console.log("postid is:", postId);
  
  //to send in postvoteclient for voting system
  const [user] = useAuthState(auth);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [loadingFollowedUsers, setLoadingFollowedUsers] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<AnswerType | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispAnswer, setDispAnswer] = useState<AnswerType[]>([] as AnswerType[]);
  const [moreAnswers, setMoreAnswers]=useState(false);
  const answersContainerRef = useRef<HTMLDivElement | null>(null);
  // console.log(postId);

  const pRef = useRef<HTMLDivElement>(null);

  //for automatic lazy load
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);

  const [commentInputVisibility , setCommentInputVisibility] = useState(answers.map(() => false))
  const [commentAdded, setCommentAdded] = useState(false);

  const toggleCommentInputVisibility = (index: number) => {
    // Update the visibility of the comment input at the given index
    setCommentInputVisibility(prevVisibility =>
      prevVisibility.map((isVisible, i) => (i === index ? !isVisible : isVisible))
    );
  };

  useEffect(() => {
    // Close all comment inputs when the component is unmounted
     setCommentInputVisibility(answers.map(() => false));


  }, [answers]);

  useEffect(()=>{
    const fetchData = async () => {
      setLoading(true);

      if(postId)
      {
      // Set up the initial query
      const ansQuery = query(
        collection(db, 'answers'),
        where("questionTitle", "==", postTitleWithSpaces),
        orderBy('createdAt', 'desc'),
        limit(5) // Adjust the limit based on your preference
      );

      const ansSnapshot = await getDocs(ansQuery);
      console.log("Answer array", ansSnapshot.docs);

      if (!ansSnapshot.empty) {
        const newAnswers = ansSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as AnswerType));
        setDispAnswer(newAnswers);
        setLastAnswer(newAnswers[newAnswers.length - 1]);
        if(newAnswers.length<5){setMoreAnswers(false)}else setMoreAnswers(true);
      }
    } 

      setLoading(false);
    };

    fetchData();
  }, [postId, answers, commentAdded]);

  // Fetch followed users on component mount
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!user) return;

      setLoadingFollowedUsers(true);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const followed = userData?.following || [];
        setFollowedUsers(followed);
      }

      setLoadingFollowedUsers(false);
    };

    fetchFollowedUsers();
  }, [user]);

  const followUser = async (userId: string) => {

    if (!user||(user&&user.isAnonymous==true)) {
      toast({
        title: " Please login to follow others ",
        variant: "destructive",
      });
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      following: arrayUnion(userId),
    });

    // Update the local state to reflect the followed user
    setFollowedUsers((prevFollowed) => [...prevFollowed, userId]);
    toast({
      title: 'You are now following this user ✅',
      variant: 'default',
    });
  };

  const unfollowUser = async (userId: string) => {
    if (!user||(user&&user.isAnonymous==true)) {
      toast({
        title: " Please login to follow others ",
        variant: "destructive",
      });
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      following: arrayRemove(userId),
    });

    // Update the local state to reflect the unfollowed user
    setFollowedUsers((prevFollowed) => prevFollowed.filter((id) => id !== userId));
    toast({
      title: 'You have unfollowed this user ❌',
      variant: 'default',
    });
  };

  const isUserFollowed = (userId: string) => followedUsers.includes(userId);

  const loadMoreAnswers = async () => {
    setLoading(true);
    //console.log("hey ", lastAnswer)
    // Set up the query for the next batch
    let ansQuery = query(
      collection(db, 'answers'),
      where("questionTitle", "==", postTitleWithSpaces),
      orderBy('createdAt', 'desc'),
      startAfter(lastAnswer ? lastAnswer.createdAt : null), // If there is a last answer, start the query after it
      limit(5) // Adjust the limit based on your preference
    );

    const ansSnapshot = await getDocs(ansQuery);
    if(ansSnapshot.docs.length<=0){setMoreAnswers(false)}else setMoreAnswers(true);
    if (!ansSnapshot.empty) {
      const newAnswers = ansSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as AnswerType));
      setDispAnswer((prevAnswers) => [...prevAnswers, ...newAnswers]);
      setLastAnswer(newAnswers[newAnswers.length - 1]);
      if(newAnswers.length<5){setMoreAnswers(false)}else setMoreAnswers(true);
    }

    setLoading(false);
  };

  //useEffect for automatic lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreAnswers();
        }
      },
      { threshold: 1 } // 1.0 means that when 100% of the target is visible within the element specified by the root option, the callback is invoked.
    );
  
    if (loadMoreButtonRef.current) {
      observer.observe(loadMoreButtonRef.current);
    }
  
    return () => {
      if (loadMoreButtonRef.current) {
        observer.unobserve(loadMoreButtonRef.current);
      }
    };
  }, [loadMoreButtonRef, loadMoreAnswers]);
  
  
  return (

    <div className=" mt-3 font-dmsans">
      {dispAnswer.length>0&&dispAnswer.map((answer: any, key) => (

        <div
          key={answer.id}
          className="rounded-2xl bg-white dark:bg-[#262626] my-3 space-y-0 break-words overflow-hidden shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]" 
        >
          <div className="px-6 py-5 flex justify-between">
            {/* <PostVoteClient
            //   postId={post.id}
            //   initialVotesAmt={_votesAmt}
            //   initialVote={_currentVote?.type}
            /> */}

            <div className="w-0 flex-1">
              <div className="flex max-h-40 mt-1 space-x-2 text-xs text-gray-500">
                {/* <div> */}
                <Avatar>
                  <div className=" relative w-full h-full aspect-square">
                    <Image
                      fill
                      src={answer.anonymity ? ('https://e7.pngegg.com/pngimages/416/62/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png') : (answer.profilePic)}
                      alt="profile picture"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                {/* </div> */}
                <span className="mt-3 text-sm font-semibold text-[#0c0c0c] dark:text-white">{answer.anonymity ? ('Anonymous') : (answer.name)}</span>{" "}
                {answer.anonymity || !user || answer.uid === user.uid ? null : (
              <div className=" flex space-x-1 mr-5">
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

                <div>
                {(
                  <button
                    className=" text-blue-500 text-xs mt-[0.87rem] p-0 hover:underline cursor-pointer"
                    onClick={() => (isUserFollowed(answer.uid) ? unfollowUser(answer.uid) : followUser(answer.uid))}
                  >
                    <span className="sm:block hidden">
                      {isUserFollowed(answer.uid) ? 'Following' : 'Follow'}
                    </span>
                  </button>
                )}
                </div>
              </div>
            )}
                {/* {formatTimeToNow(new Date(post.createdAt))} */}
              </div>
              {/* <a href={`/postPage/${answer.id}`}>
                <h1 className="text-3xl font-semibold py-2 leading-6 text-gray-900 dark:text-white">
                  {answer.title}
                </h1>
              </a> */}

              {answer.answerImageURL ? (
                  <div className="relative w-full h-[400px] mt-2">
                    <Image
                      src={answer.answerImageURL}
                      className="rounded-md"
                      layout="fill"
                      alt="answer image"
                      objectFit="contain"
                    />
                  </div>
                ) : null
              }

              <div
                className="relative text-base max-h-50 text-[#282829] dark:text-white w-full mt-2 "
                ref={pRef}
              >
                {/* <EditorOutput content={post.content} /> */}
            <p className="ProseMirror">{answer.description ? parse(answer.description) : ""}</p>

                {/* <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white/80 dark:from-[#262626] to-transparent'></div> */}
                {/* {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              
            ) : null} */}
              </div>
            </div>
          </div>

          <div className=" dark:bg-[#1A1A1B]/65 z-20 flex justify-between gap-x-3 text-sm px-4 py-4 sm:px-6">

            <PostVoteClientPhone postId={answer.id} postType="answers"  userId={user?.uid!} questionId={postId}/>
            
            <div className=" flex gap-x-3">
              <button
                // href={`/postPage/${answer.id}`}
                className="w-fit flex items-center gap-2"
                onClick={() => toggleCommentInputVisibility(key)}
              >

                <MessageSquare className="h-4 w-4" /> <span className=' sm:block hidden'>{answer.comments} Comments</span>

              </button>
              <button
                className="w-fit flex items-center gap-2"
              >
                <Share className="h-4 w-4" /> <span className=' sm:block hidden'>Share</span>
              </button>
              <button
                className="w-fit flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" /> <span className=' sm:block hidden'>Save</span>
              </button>
            </div>
          </div>

          {/* Add a comment input that shows or hides when the comments button is clicked */}
          {commentInputVisibility[key] && (
            <CommentBox postTitleWithSpaces={postTitleWithSpaces} changeHandler={setCommentAdded} answerId={answer.id} toggleCommentInputVisibility={() => toggleCommentInputVisibility(key)} />
          )} 

        </div>
      ))}
      <div className="flex justify-center py-6">
      { loading?<div><Loader/></div>:moreAnswers?
            <button className="mb-2" onClick={loadMoreAnswers} disabled={loading} ref={loadMoreButtonRef}>
              
            </button>:<div>No More Answers...</div>
          }

      </div>
    </div>
  );
};
export default AnsPost;

