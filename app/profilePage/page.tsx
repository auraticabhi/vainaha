"use client";

import ProfileCard from "@/components/profilePage/ProfileCard";
import Image from "next/image";
import React, { useEffect, useState , useRef } from "react";
import { useRouter } from "next/navigation";


import { auth , db } from '@/utils/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { collection, query , where , onSnapshot, orderBy, and, startAfter, limit, getDocs , doc , getDoc, deleteDoc, collectionGroup, Timestamp} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Post from '@/components/Post';
import AnswerPost from '../../components/AnswerPost'
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UserDetails from "@/components/UserDetails";
import { AlbumArtwork } from "../events/components/album-artwork";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast";
import { FaChevronDown } from "react-icons/fa6";


type Props = {};

type PostType = {
  id: string;
  name: string;
  title: string;
  description: string;
  profilePic: string;
  postImage: string;
  likes: number;
  shares: number;
  comments: number;
  questionImageURL: string;
  createdAt: string;
  anonymity: boolean;
  uid: string
  // Add any other fields as necessary
};

type AnswerType = {
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
  uid: string;
}

type EventType = {
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
  sponsors: string[];
};

const ProfilePage = (props: Props) => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  //for automating loadmore lazy load button ...
  const loadMoreButtonRef = useRef<HTMLDivElement>(null);

  //followF
  const [followers, setFollowers] = useState<any>([]);
  const [following, setFollowing] = useState<any>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [answerLastDoc, setAnswerLastDoc] = useState<any>(null);
  const [answerStart, setAnswerStart] = useState<boolean>(true);
  const [answerMorePosts, setAnswerMorePosts] = useState(false);
  // console.log(user);
  const [postType, setPostType] = useState("savedEvents");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnswers, setIsAnswers] = useState(false);
  const [questions, setQuestions] = useState<PostType[]>([]);
  const [anonymousQuestions, setAnonymousQuestions] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [LastDoc, setLastDoc] = useState<any>(null);
  const [anonymousMorePosts, setAnonymousMorePosts] = useState(false);
  const [anonymousLastdoc, setAnonymousLastdoc] = useState<any>(null);
  const [start, setStart] = useState<boolean>(true);
  const [anonymousStart, setAnonymousStart] = useState<boolean>(true);
  const [morePosts, setMorePosts] = useState(false);
  const [sortType, setSortType] = useState("recent")
  const [followChange, setFollowChange] = useState("")
  const [removeF, setRemoveF] = useState("");
  const [reload, setReload] = useState(false);
  const {toast} = useToast();
  
  //savedPosts
  const [ savedPosts , setSavedPosts] = useState<PostType[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventType[]>([]);

  const [loadMore, setLoadMore] = useState<boolean>(false);

  const handleDelete = async(postId:string)=>{
    try {
      // Delete the post from the 'questions' collection
      const postRef = doc(db, 'questions', postId);
      await deleteDoc(postRef);
      toast({
        title:'Deleted Sucessfully',
        variant:'default',
      })
      // Remove the deleted post from the state
      if (postType === 'normal') {
        setQuestions((prevQuestions) => prevQuestions.filter((post) => post.id !== postId));
      } else {
        setAnonymousQuestions((prevQuestions) => prevQuestions.filter((post) => post.id !== postId));
      }
  
      
    } catch (error) {
      toast({
        title:'Something went wrong',
        variant:'destructive',
      })
      console.error('Error deleting post: ', error);
    }
  }

  const handleAnswerDelete = async(postId:string)=>{
    try {
      // Delete the post from the 'questions' collection
      const postRef = doc(db, 'answers', postId);
      await deleteDoc(postRef);
      toast({
        title:'Deleted Sucessfully',
        variant:'default',
      })
      // Remove the deleted post from the state
      if (postType === 'answers') {
        setAnswers((prevAnswers) => prevAnswers.filter((post) => post.id !== postId));
      } 
      
    } catch (error) {
      toast({
        title:'Something went wrong',
        variant:'destructive',
      })
      console.error('Error deleting post: ', error);
    }
  }

  const fetchFollowers = async () => {
    setPostType('followers');
    try {
      setLoadingFollowers(true);
      if(user){
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(userData);
        setFollowers(userData.followers);
      }
    }
      setLoadingFollowers(false);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setLoadingFollowers(false);
    }
    console.log("Follower A ", followers);
  };

  const fetchFollowing = async () => {
    setPostType('following');
    try {
      setLoadingFollowing(true);
      if(user){
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFollowing(userData.following);
      }
    }
      setLoadingFollowing(false);
    } catch (error) {
      console.error("Error fetching following:", error);
      setLoadingFollowing(false);
    }
  };

  //console.log("user g: ", user);

  useEffect(() => {
    //console.log("heyyyyyyyyyyy");
    const fetchData = async () => {
      try {
        if (!user && !loading) {
          router.push("/auth");
        } else {
          setLoadingPosts(true);
          const questionsRef = collection(db, "questions");
          let q;

          if (postType === "normal") {
            if (start) {
              q = query(
                questionsRef,
                and(
                  where("uid", "==", user?.uid),
                  where("anonymity", "==", false)
                ),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                limit(7)
              );
              const snapshot = await getDocs(q);
              setQuestions(
                snapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as PostType)
                )
              );
              const lastdoc = snapshot.docs[snapshot.docs.length - 1];
              if (lastdoc) setMorePosts(true);
              else setMorePosts(false);
              setLastDoc(lastdoc);
              setStart(false);
            } else {
              const moreQ = query(
                questionsRef,
                and(
                  where("uid", "==", user?.uid),
                  where("anonymity", "==", false)
                ),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                startAfter(LastDoc),
                limit(7)
              );

              const moreSnapshot = await getDocs(moreQ);
              setQuestions((prevQuestions) => [
                ...prevQuestions,
                ...moreSnapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as PostType)
                ),
              ]);
              const lastdoc = moreSnapshot.docs[moreSnapshot.docs.length - 1];
              if (lastdoc) setMorePosts(true);
              else setMorePosts(false);
              setLastDoc(lastdoc);
            }
          } else if(postType==="anonymous") {
            if (anonymousStart) {
              q = query(
                questionsRef,
                and(
                  where("uid", "==", user?.uid),
                  where("anonymity", "==", true)
                ),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                limit(7)
              );
              const snapshot = await getDocs(q);
              setAnonymousQuestions(
                snapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as PostType)
                )
              );
              const lastdoc = snapshot.docs[snapshot.docs.length - 1];
              if (lastdoc) setAnonymousMorePosts(true);
              else setAnonymousMorePosts(false);
              setAnonymousLastdoc(lastdoc);
              setAnonymousStart(false);
            } else {
              const moreQ = query(
                questionsRef,
                and(
                  where("uid", "==", user?.uid),
                  where("anonymity", "==", true)
                ),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                startAfter(anonymousLastdoc),
                limit(7)
              );

              const moreSnapshot = await getDocs(moreQ);
              setAnonymousQuestions((prevQuestions) => [
                ...prevQuestions,
                ...moreSnapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as PostType)
                ),
              ]);
              const lastdoc = moreSnapshot.docs[moreSnapshot.docs.length - 1];
              if (lastdoc) setAnonymousMorePosts(true);
              else setAnonymousMorePosts(false);
              setAnonymousLastdoc(lastdoc);
            }
          }
          else if(postType=="answers"){
            if (answerStart) {
              q = query(
                collection(db, "answers"),
                where("uid", "==", user?.uid),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                limit(7)
              );
              const snapshot = await getDocs(q);
              setAnswers(
                snapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as AnswerType)
                )
              );
              const lastdoc = snapshot.docs[snapshot.docs.length - 1];
              if (lastdoc) setAnswerMorePosts(true);
              else setAnswerMorePosts(false);
              setAnswerLastDoc(lastdoc);
              setAnswerStart(false);
            } else {
              const moreQ = query(
                collection(db, "answers"),
                where("uid", "==", user?.uid),
                orderBy("createdAt", `${sortType=='recent'?"desc":"asc"}`),
                startAfter(answerLastDoc),
                limit(7)
              );

              const moreSnapshot = await getDocs(moreQ);
              setAnswers((prevAnswers) => [
                ...prevAnswers,
                ...moreSnapshot.docs.map(
                  (doc) => ({ id: doc.id, ...doc.data() } as AnswerType)
                ),
              ]);
              const lastdoc = moreSnapshot.docs[moreSnapshot.docs.length - 1];
              if (lastdoc) setAnswerMorePosts(true);
              else setAnswerMorePosts(false);
              setAnswerLastDoc(lastdoc);
            }
            }
          }
        setLoadingPosts(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingPosts(false);
      }
      };
      fetchData();
    }, [user, loading, router, postType, loadMore, reload]);

    //fetching the savedPosts from the 'users' collection
    // Fetching the savedPosts from the 'users' collection

    useEffect(()=>{
      if(postType=="following"&&followChange!=""){
      let newList = following.filter((followi:string)=>{
        return followi!=followChange;
      })
      setFollowing(newList)
      }
    }, [followChange])

    useEffect(()=>{
      if(postType=="followers"&&removeF!=""){
        let newList = followers.filter((follower:string)=>{
          return follower!=removeF;
        })
        setFollowers(newList)
      }
    }, [removeF])

useEffect(() => {
  const fetchSavedPosts = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedPostIds = userData.savedPosts;
      const savedPostsPromises = savedPostIds.map((postId: string) => {
        const postRef = doc(db, 'questions', postId); // Replace 'questions' with the name of your posts collection
        return getDoc(postRef);
      });

      const savedPostsDocs = await Promise.all(savedPostsPromises);
      const savedPosts = savedPostsDocs.map((doc) => ({ id: doc.id, ...doc.data() } as PostType));
      setSavedPosts(savedPosts);
    }
  };

  fetchSavedPosts();
}, [user]);

useEffect(() => {
  const fetchSavedEvents = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedEventIds = userData.savedEvents;
      const savedEventsPromises = savedEventIds.map((EventId: string) => {
        const EventRef = doc(db, 'events', EventId); // Replace 'questions' with the name of your posts collection
        return getDoc(EventRef);
      });

      const savedEventsDocs = await Promise.all(savedEventsPromises);
      const savedEvents = savedEventsDocs.map((doc) => ({ id: doc.id, ...doc.data() } as EventType));
      setSavedEvents(savedEvents);
    }
  };

  fetchSavedEvents();
}, [user]);

    const handleToggleSwitchNormal = () => {
      setStart(true);
      //setAnonymousStart(true);
      setIsAnonymous(false);
      setPostType('normal');
    };

    const handleToggleSwitchAnonymous = () => {
      setAnonymousStart(true);
      setIsAnonymous(true);
      setPostType('anonymous');
    };

    const handleToggleSwithcSaved = () => {
      setPostType('saved');
      setIsAnonymous(false);
      // setStart(false);
    }

    const handleToggleSwithSavedEvents=()=>{
      setPostType('savedEvents');
      setIsAnonymous(false);
    }

    const handleLoadMore = () => {
      setLoadMore((prev)=>!prev)
    };


    //useEffect for automting lazyload functionality
  useEffect(() => {
    if(morePosts || anonymousMorePosts ||answerMorePosts){
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
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
  }
  }, [loadMoreButtonRef, handleLoadMore , morePosts , anonymousMorePosts]);

    const handleSortChange = ()=>{
      setStart(true);
      setAnonymousStart(true);
      setQuestions([]);
      setAnonymousQuestions([]);
      setAnswers([]);
      setAnswerStart(true);
      setReload((prev)=>!prev)
    }

  function handleToggleSwithAnswers(){
    setAnswerStart(true);
    setIsAnswers(true);
    setPostType('answers')
  }

  if(loading)
  {
    return <Loader/>
  }
  else
  {


  return (
    <div className='mt-3 font-dmsans md:container md:max-w-[84rem] md:mx-auto '>
        <ProfileCard user={user}/>
        {/* <div className='toggleSwitch flex items-center justify-center mt-5'>
        <label className="inline-flex items-center cursor-pointer">
  <input type='checkbox' checked={isAnonymous} onChange={handleToggleSwitch} className="sr-only peer"/>
  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isAnonymous ? 'Anonymous Posts' : 'Normal Posts'}</span>
</label>
      </div> */}
      <div className='toggleSwitch mt-2 overflow-auto'>
          <Tabs defaultValue="savedEvents" className="w-full">
      <TabsList className="grid gap-2 grid-cols-7 w-[725px]">
        {/* <TabsTrigger value="posts" onClick={handleToggleSwitchNormal} >Posts</TabsTrigger>
        <TabsTrigger value="answers" onClick={handleToggleSwithAnswers}>Answers</TabsTrigger>
        <TabsTrigger value="anonymous" onClick={handleToggleSwitchAnonymous}>Anonymous</TabsTrigger>
        <TabsTrigger value="saved" onClick={handleToggleSwithcSaved}>Saved Posts</TabsTrigger> */}
        <TabsTrigger value="savedEvents" onClick={handleToggleSwithSavedEvents}>Saved Events</TabsTrigger>
        <TabsTrigger value="followers" onClick={fetchFollowers}>Followers</TabsTrigger>
        <TabsTrigger value="following" onClick={fetchFollowing}>Following</TabsTrigger>
      </TabsList>
    </Tabs>
    </div>

    {(postType=='normal'||postType=='anonymous'||postType=='answers'|| postType=='saved' || postType=='savedEvents' || postType == 'followers' || postType == "following") &&
      <div className="border-y-[1px] border-black border-opacity-15 py-2 flex justify-between items-center">
        <div className="font-[600] opacity-80 ml-2">
        {postType=='normal'?<div>Posts</div>:postType=='anonymous'?<div>Anonymous</div>:postType=='answers'?<div>Answers</div>:postType=='saved'?<div>Saved Posts</div>:postType=='savedEvents'?<div>Saved Events</div>:postType=='followers'?<div>Followers</div>:<div>Following</div>}
        </div>
        <div className="mr-2">

        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="font-[600] flex items-center gap-1 cursor-pointer opacity-75 rounded-md p-1 hover:bg-slate-200">{`${sortType=='recent'?"Most Recent":"Oldest"}`}<span><FaChevronDown/></span></div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-20">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={()=>{setSortType('recent');handleSortChange()}}>
            Most Recent
         
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>{setSortType('oldest');handleSortChange()}}>
            Oldest
            
          </DropdownMenuItem>
          </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

        </div>
      </div>
}
      <div>
        {
          <div>
            {postType=='anonymous' ? (
              <div>
                {anonymousQuestions?.length === 0
                  ? !loadingPosts && (
                      <div className="flex items-center justify-center flex-col mt-5 w-full">
                        <Image
                          src="/trash.png"
                          width={300}
                          height={300}
                          className=" w-[10rem] h-[9rem] rounded-full"
                          alt="Profile Pic"
                        />
                        <h1 className=" text-2xl text-zinc-500">
                          No posts yet
                        </h1>
                      </div>
                    )
                  : anonymousQuestions &&
                    anonymousQuestions.map((post, index) => (
                      // <Post key={index} post={post} />
                      <div key={index} className=" my-1">
                        <Post post={post} isProfile={true} handleDelete={handleDelete} />
                      </div>
                    ))}
              </div>
            ) : postType=='normal'? 
            <div>
              {
            questions?.length === 0 ? (
              !loadingPosts && (
                <div className="flex items-center justify-center flex-col mt-5 w-full">
                  <Image
                    src="/trash.png"
                    width={300}
                    height={300}
                    className=" w-[10rem] h-[9rem] rounded-full"
                    alt="Profile Pic"
                  />
                  <h1 className=" text-2xl text-zinc-500">No posts yet</h1>
                </div>
              )
            ) : (
              questions && postType === "normal" &&
              questions.map((post, index) => (
                // <Post key={index} post={post} />
                <div key={index} className=" my-1">
                  <Post post={post} isProfile={true} handleDelete={handleDelete} />
                </div>
              ))
            )
              }
            </div>
            :<div>
              {
                postType=='saved'?<div>
                  { savedPosts.length !== 0 ? (
        savedPosts.map((post, index) => (
          <div key={index} className="my-1">
            <Post post={post} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center flex-col mt-5 w-full">
          <Image
            src="/trash.png"
            width={300}
            height={300}
            className=" w-[10rem] h-[9rem] rounded-full"
            alt="Profile Pic"
          />
          <h1 className=" text-2xl text-zinc-500">No posts yet</h1>
        </div>
      )}
                </div>:<div>
                  {
                    postType=='answers'?
                    
                    <div>
              {
            answers?.length === 0 ? (
              !loadingPosts && (
                <div className="flex items-center justify-center flex-col mt-5 w-full">
                  <Image
                    src="/trash.png"
                    width={300}
                    height={300}
                    className=" w-[10rem] h-[9rem] rounded-full"
                    alt="Profile Pic"
                  />
                  <h1 className=" text-2xl text-zinc-500">No posts yet</h1>
                </div>
              )
            ) : (
              answers && postType === "answers" &&
              answers.map((post, index) => (
                // <Post key={index} post={post} />
                <div key={index} className=" my-1">
                  <AnswerPost post={post} isProfile={true} handleDelete={handleAnswerDelete} />
                </div>
              ))
            )
              }
            </div>
                    :<div>{
                      // <NetworkList/> Will make a new component for followers and following list till then displaying no posts found.
        //               <div className="flex items-center justify-center flex-col mt-5 w-full">
        //   <Image
        //     src="/trash.png"
        //     width={300}
        //     height={300}
        //     className=" w-[10rem] h-[9rem] rounded-full"
        //     alt="Profile Pic"
        //   />
        //   <h1 className=" text-2xl text-zinc-500">No posts yet</h1>
        // </div>

        //followerList

        <div className="">
          {
            postType=='followers'?<div>
            {
              loadingFollowers?<Loader/>:
              followers&&followers.length>0?<div>
                {
                  followers.map((follower:string, index:number)=>{
                    return <div key={index}>
                      <UserDetails uid={follower} type={"followers"} handleFchange={setRemoveF}/>
                    </div>
                  })
                }
              </div>:<div>No Followers Found...</div>
            }
            </div>:postType=='following'?<div>
              {
                loadingFollowing?<Loader/>:
                following&&following.length>0?<div>
                  {
                    following.map((following:string, index:number)=>{
                      return <div key={index}>
                        <UserDetails uid={following} type={"following"} handleFchange={setFollowChange}/>
                      </div>
                    })
                  }
                </div>:<div>
                  No Following Found...
                </div>
              }
            </div>:<div>
              {
                postType=='savedEvents'?<div className="grid lg:grid-cols-4 grid-cols-1 gap-[7rem] pb-4">
                { savedEvents.length !== 0 ? (
      savedEvents.map((post, index) => (
        <div key={index} className="mb-1">
          <AlbumArtwork post={post}/>
        </div>
      ))
    ) : (
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 ">
        <Image
          src="/trash.png"
          width={300}
          height={300}
          className=" w-[10rem] h-[9rem] items-center justify-center flex mx-auto rounded-full"
          alt="Profile Pic"
        />
        <h1 className=" text-2xl text-zinc-500 text-center">You have no Saved Events</h1>
      </div>
    )}
    </div>:<div>Invalid Tab</div>
              }
            </div>
          }
        </div>
                      }</div>
                  }
                </div>
              }
            </div>
            }
          </div>
        }

      </div>
      <div>
      {(postType=='normal'||postType=='anonymous'||postType=='answers')&& //will change this once lazy loading is available for all the tabs.
      <div className="flex items-center justify-center">
        {loadingPosts ? (
          <div>
            <Loader />
          </div>
        ) : (
          <div className="mt-2 mb-5">
            {isAnonymous ? (
              anonymousMorePosts ? (
                <div ref={loadMoreButtonRef}>
                  <button onClick={handleLoadMore}></button>
                </div>
              ) : (
                <div>No More Posts...</div>
              )
            ):(
              isAnswers?(
                answerMorePosts ? (
                  <div ref={loadMoreButtonRef}>
                  <button onClick={handleLoadMore}></button>
                  </div>
                ) : (
                  <div>No More Posts...</div>
                )
              ):
                morePosts ? (
                  <div ref={loadMoreButtonRef}>
                  <button onClick={handleLoadMore}></button>
                </div>
            ) : (
              <div>No More Posts...</div>
            )
            )}
          </div>
        )}
      </div>
      }
      </div>
    </div>
  );
}
};

export default ProfilePage;
