
"use client";

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import parse from 'html-react-parser';

import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell} from "@nextui-org/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/components/ui/use-toast';

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback , AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CalendarCheck2, HistoryIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { History } from 'lucide-react';
import { FileBadge } from 'lucide-react';
import { Building } from 'lucide-react';

import { Timestamp, addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db , auth , storage } from '@/utils/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { z } from 'zod';
import { eventCommentSchema } from '@/schemas/eventComment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';

import { Tiptap } from '@/components/TipTapAns';

import imageCompression from 'browser-image-compression';
import { get } from 'http';
import { useAuthState } from 'react-firebase-hooks/auth';
import EventCommentPost from '@/components/eventDetailsPage/eventCommentPost';
import Emage from "../../../public/alexandre-pellaes-6vAjp0pscX0-unsplash.jpg"
import PImage from "../../../public/guest-user.webp"


type Props = {
  params: {
    eventTitle: string
  }
}

type Input = z.infer<typeof eventCommentSchema>;

type EventDetailsType = {
  title: string
  description: string
  eventImageURL: string
  dateOfEvent: any
  locationOfEvent: string
  durationOfEvent: number
  registrationLink: string
  uid: string
  hashtags: Array<string>
  createdAt: string
  name: string
  profilePic: string
  sponsors: Array<string>

  preConferenceDate: any
  registrationStartDate: any
  registrationEndDate: any
  earlyBirdRegistrationFee: number
  lateRegistrationFee: number
  creditPoints: number
  contactNumber: number
}

type EventCommentType = {
  eventId: string
  eventTitle: string
  comment: string
  uid: string
  name: string
  profilePic: string
  createdAt: string
  imageUrl: string
}

const EventDetailsPage = ({ params: { eventTitle } }: Props) => {

  const router = useRouter();

  const { toast } = useToast();

  const [user , loading] = useAuthState(auth);

  const eventTitleDecoded = decodeURIComponent(eventTitle as string).split("-").join(" ");
  console.log(eventTitleDecoded);


  //fetching evenDetails from the database based on the eventTitle

  const [eventObject , setEventObject] = useState<EventDetailsType>({} as EventDetailsType);
  const [eventComment , setEventComment] = useState<EventCommentType[]>([] as EventCommentType[]);


  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress , setProgress] = useState<number | null>(0);
  const [previewImg, setPreviewImg] = useState<any>(null);
  const [sponsors, setSponsors] = useState<string[]>([] as string[]);
  const [userData, setUserData] = useState<any>({});



  //fetching the event details from the database and all the comments related to that event at the same time
  useEffect(() => {
    const eventRef = collection(db, 'events');
    const q = query(eventRef, where('title', '==', eventTitleDecoded));

    const eventsUnsub = onSnapshot(q, (snapshot) => {
      if(!snapshot.empty)
        {
          const doc = snapshot.docs[0];
          const data = doc.data() as EventDetailsType;
          setEventObject(data);

          //listener for the comments of the event
          const eventCommentsRef = collection(db, 'eventsComments');
          const q = query(eventCommentsRef, where('eventId', '==', doc.id));
          const commentsUnsub = onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map((doc) => {
              const data = doc.data() as EventCommentType;
              return {
                eventId: data.eventId,
                eventTitle: data.eventTitle,
                comment: data.comment,
                uid: data.uid,
                name: data.name,
                profilePic: data.profilePic,
                createdAt: data.createdAt,
                imageUrl: data.imageUrl,
              }
            })
            setEventComment(comments);
          })

          return () => {
            eventsUnsub();
            commentsUnsub();
          }
        }
        else
        {
          console.log('No such event found');
          router.push('/404'); 
        }
    }
    )
  }
  ,[eventTitleDecoded])

  useEffect(()=>{
    console.log("chal bhai");
    console.log(eventObject);
    const fetchUserData = async () => {
      try {
        if(eventObject.uid){
        const userRef = doc(db, "users", eventObject.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Creator ", userData);
          setUserData(userData);
        }
      }
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchUserData();
  }, [eventObject]);

  let dateString;
  if (eventObject.dateOfEvent) {
  //const date = eventObject.dateOfEvent.toDate();
  //dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  dateString = eventObject.dateOfEvent;
  }




  //comment section for the event
  const form = useForm<Input>({
    resolver: zodResolver(eventCommentSchema),
    defaultValues: {
      comment: "",
    },
  });


  const uploadImage = async(file: any) => {
    if (file == null) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const imageUrl = event.target.result;
          setPreviewImg(imageUrl);
        } else {
          console.error('Error reading file:', file);
          setPreviewImg(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImg(null);
    }

    const storageRef = ref(storage, `events/${file.name}`);

    try {
      // Set compression options
    const options = {
      maxSizeMB: 1, // Max size in megabytes
      maxWidthOrHeight: 800, // Max width or height
      useWebWorker: true, // Use web worker for better performance (optional)
    };
  
      // Compress the image
      const compressedFile = await imageCompression(file, options);

    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

    uploadTask.on(
      "state_changed",
      (snapshot: any) => {
        // You can use this to display upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setProgress(progress);
      },
      (error: any) => {
        // Handle unsuccessful uploads
        console.log("Upload failed", error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          // Save the URL to state or wherever you want to keep it
          setImageUrl(downloadURL);
        });
      }
    );
    }catch(err){
      console.log("Error compressing and uploading Image...")
    }
  };

  async function createEventComment(data: Input) {

    const eventRef = collection(db, 'events');
    const q = query(eventRef, where('title', '==', eventTitleDecoded));
    const snapshot = await getDocs(q);

    if(!snapshot.empty)
      {
        const doc = snapshot.docs[0];

        const eventId = doc.id;
        const docRef = await addDoc(collection(db, "eventsComments"),{
          eventId: eventId,
          eventTitle: eventTitleDecoded,
          comment: data.comment,
          uid: user?.uid,
          name: user?.displayName,
          profilePic: user?.photoURL,
          createdAt: new Date(),
          imageUrl: imageUrl
        })

        console.log("Document written with ID: ", docRef.id);

        toast({
          title: "Comment Posted",
        })
        form.reset();
        setImageUrl(null);
        setProgress(0);
        setPreviewImg(null);

      }
      else
      {
        console.log('No such event found');
        router.push('/404');
      }
  }    

  function onSubmit(data: Input) {
    createEventComment(data);
    setIsCommentBoxOpen(true);
  }



  return (
    <div className=' grid md:grid-cols-2 lg:grid-cols-9 gap-y-4 md:gap-x-6 pb-6 font-jakarta mt-3'>
        <div className=' md:col-span-6 col-span-2 order-first  '>

          <div className=' w-full  bg-white dark:bg-[#262626] rounded-2xl shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06) break-words overflow-hidden lg:mt-[4rem] font-dmsans p-10'>
            <div className=''>
                <div className=''>
                  {
                    eventObject.eventImageURL ? 
                    <Image src={eventObject.eventImageURL} width={1920} height={1080} alt='Conference' className='rounded-2xl' />
                    :
                    <Image alt='conftempimage' src={Emage} />

                  }
                </div>
                <div className=' max-w-[70%]'>
                    <div className='p-4 space-y-7'>
                        <h1 className='text-[25px] font-[600] font-jakarta text-[#311b92]'>{eventObject.title}</h1>
                    </div>
                </div>
            </div>

            {/* <div className=' max-w-[70%] p-4 gap-3'>
                <div className=' '>
                    <div className=' flex gap-3 '>
                        <Image
                        src={eventObject.profilePic}
                        width={10}
                        height={10}
                        alt='Conference'
                        className=' w-10 h-10 mt-2 rounded-full'
                        />
                        <div className=' space-y-1'>
                            <div className=' text-gray-700 flex gap-2 py-4'>
                                <p>By <span className='text-black font-bold'>{eventObject.name}</span></p>
                            </div>
                            
                        </div>
                    </div>

                    
                    

                </div>
            </div> */}

            <div className='md:flex gap-10 md:justify-between flex-row border border-[#d3d3d3] rounded-md m-4'>

            <div className=' p-4 space-y-3 mt-3'>
                <h1 className=' font-[500] text-[12px] text-[#311b92]'>Date and Time</h1>
                <div className=' flex gap-3'>
                    <CalendarCheck2 size={19} />
                    {dateString && <p className=' font-[400] text-gray-900 text-[12px]'>{dateString}</p>}
                </div>
            </div>

            <div className="mb-4">
            <h1 className=' font-[500] text-[12px] px-4 my-3 lg:mt-6 text-[#311b92]'>Location</h1>
            <div className=' px-4 flex gap-x-5'>
                <div className=' mt-2'>
                    <MapPin size={19} />
                </div>
                <div className=' flex-col gap-y-3'>
                      {
                        eventObject.locationOfEvent && 
                        (() => {
                          const [location, landmark] = eventObject.locationOfEvent.split(', ');
                          return (
                            <>
                              <p className=' font-[500] text-[12px]'>{location}</p>
                              <p className=' text-[12px]'>{landmark}</p>
                            </>
                          )
                        })()
                      }
                    <div className=' flex gap-1'>
                        <p className=' text-[12px] font-[500] text-black hover:underline cursor-pointer'>Show Map</p>
                        <ChevronDown className='text-blue-400' size={19} />
                    </div>
                </div>
            </div>
            </div>

            <div className='mb-6'>
              <h1 className='font-[500] px-4 my-3 mt-6 text-[12px] text-[#311b92]'>Duration of the event</h1>
              <div className='px-4 flex gap-2 text-[12px]'><span><Clock className='h-5 w-5' /></span><div className='mt-[2px]'>{eventObject.durationOfEvent} hours</div></div>
              
            </div>

            </div>

            <div className='p-4 mt-5'>
              <div className=' flex gap-4 border border-black rounded-2xl bg-gray-300 p-2'>
                <div className=' text-[20px] font-[500]'>Registration Link :</div>
                <a target='_blank' href="#" className=' text-blue-400 underline cursor-pointer text-[20px]'>{eventObject.registrationLink}</a>
              </div>
            </div>

            <div className=' p-4 mt-1'>
            <h1 className=' font-[500] text-[20px] mb-4 text-[#311b92]'>Description</h1>
            <div className=' font-medium my-3 mt-6'>
                  <div className=''>
                      <p className=' text-[17px] font-[400]'>{eventObject.description && parse(eventObject.description)}</p>
                  </div>
            </div>
            </div>

            {/* <div className='rounded-md p-4'>
  <table className='border border-[#d3d3d3] border-collapse w-full rounded-md'>
    <thead>
      <tr>
        <th className='text-[20px] font-[500] border border-[#d3d3d3]'>Event Info</th>
        <th className="text-[20px] font-[500] border border-[#d3d3d3]">Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Pre-Conference Date :</td>
        <td className='text-blue-400 text-[17px] underline cursor-pointer border border-[#d3d3d3]'>{eventObject.preConferenceDate && eventObject.preConferenceDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Registration Start Date :</td>
        <td className='text-blue-400 text-[17px] underline cursor-pointer border border-[#d3d3d3]'>{eventObject.registrationStartDate && eventObject.registrationStartDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Registration End Date :</td>
        <td className='text-blue-400 text-[17px] underline cursor-pointer border border-[#d3d3d3]'>{eventObject.registrationEndDate && eventObject.registrationEndDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Early Bird Registration Fee :</td>
        <td className='text-blue-400 text-[17px] cursor-pointer border border-[#d3d3d3]'>{`₹ ${eventObject.earlyBirdRegistrationFee}`}</td>
      </tr>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Late Registration Fee :</td>
        <td className="text-blue-400 text-[17px] cursor-pointer border border-[#d3d3d3]">{`₹ ${eventObject.lateRegistrationFee}`}</td>
      </tr>
      <tr>
        <td className='border text-[17px] border-[#d3d3d3]'>Contact Number :</td>
        <td className="text-blue-400 text-[17px] underline cursor-pointer border border-[#d3d3d3]">{eventObject.contactNumber}</td>
      </tr>
    </tbody>
  </table>
</div> */}


            <div className=' p-4 mb-5 mt-2'>
                <h1 className=' font-[500] text-[20px] mb-4 '>Tags</h1>

                <div>
                    <div className=' space-y-2'>
                        {eventObject.hashtags?(
                          eventObject.hashtags.map((hashtag, index)=>{
                            return <span key={index} className='text-blue-600 ml-2 text-[17px]'>
                            {hashtag}
                            </span>
                          })
                        ):<div>No Tags Found...</div>
                        }
                    </div>
                </div>

            </div>

            </div>

            <div className="h-fit">

        <div className='lg:hidden col-span-3 sticky overflow-hidden h-fit rounded-2xl border border-gray-300 shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]'>
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle className='text-[24px] font-[500]'>Created By</CardTitle>
              <div className='text-xs text-muted-foreground'>Moderator/Creator of this event.</div>
            </CardHeader>
            <CardContent className="">

            <div className="flex mb-1">
              <div>
            <Image
                        src={userData.profilePic}
                        width={250}
                        height={250}
                        alt='Conference'
                        className=' w-10 h-10 rounded-full'
                        />
            </div>  
          <div className="ml-4 space-y-1">
          <p className="text-[17px] font-medium leading-none">{userData.name}</p>
            <p className="text-[17px] text-muted-foreground">{userData.email}</p>
          </div>
          <div className="ml-auto font-medium"></div>
        </div>
              
            </CardContent>
          </Card>
        </div>

        <div className='mt-3 lg:hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]'>
          <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader className='text-sm pb-1'>
                <CardTitle className='text-[24px] font-[500]'>Register</CardTitle>
                <div className='text-xs text-muted-foreground'>Verify the third-party sites before entering data.</div>
              </CardHeader>
              <CardContent className="">
                <p className='text-[17px]'>Register for this event on a single click</p>
                <div className=' flex items-end justify-end mt-4'>
                  <Button className=' w-full'><a target='_blabk' href="#">Register now</a></Button>
                </div>
              </CardContent>
          </Card>
        </div>

        <div className='mt-3 lg:hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300 shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]'>
          <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader>
                <CardTitle className='text-[24px] font-[500]' >Credits</CardTitle>
                <div className='text-xs text-muted-foreground'>Few events comes with Govt. recognized credits. <span className='text-black'>Check Info*</span></div>
              </CardHeader>
              <CardContent className="">
                <h1 className=' text-[30px] flex items-center justify-center mx-auto'>
                  {
                    eventObject.creditPoints 
                    ?
                    eventObject.creditPoints
                    :
                    0
                  }
                </h1>
              </CardContent>
          </Card>
        </div>

        <div className=' mt-3 lg:hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300 order-last shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]'>
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle className='text-[24px] font-[500]'>Sponsors</CardTitle>
              <div className='text-xs text-muted-foreground'>Either sponsoring this event or this post.</div>
            </CardHeader>
            <CardContent className="grid gap-8 uppercase">

              {eventObject.sponsors?(
                eventObject.sponsors.map((sponsor, index)=>{
                  return <div key={index} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback><Building/></AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="text-[17px] font-medium leading-none">
                      {sponsor}
                    </div>
                  </div>
                </div>
                }
                )
              ):<div>No Sponsors Found...</div>
            }
              
            </CardContent>
          </Card>
        </div>


        </div>

            {/* Comment box for the event */}
            <div className=" mt-3">
          {false ? (
            <div
              className="rounded-3xl border border-gray-300 p-4 cursor-pointer mx-2 md:mx-0 my-6"
              onClick={() => setIsCommentBoxOpen(false)}
            >
              Write a Comment...
            </div>
          ) : (
            <div className=" rounded-3xl border border-gray-300 p-4 cursor-pointer">
              <Form {...form}>
                <form
                  className=" relative space-y-3 overflow-hidden"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  {/* TipTap Editor */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        {/* <FormLabel>Write an answer...</FormLabel> */}
                        <FormLabel className='text-[17px] font-[500]'>Comment Box</FormLabel>
                                <div className={`${isFocused?"border-black border-[2.3px]": "border-[2px] border-[#d3d7dd]"} rounded-lg`} onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                >
                        <FormControl>
                          <Controller
                            control={form.control}
                            name="comment"
                            render={({ field }) => <Tiptap {...field} setImageUpload={setImageUpload} uploadImage={uploadImage} progress={progress}/>}
                          />
                        </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  

                  <div className=" space-x-2 flex items-end justify-end ">
                    
                    <Button variant="outline" className=" rounded-3xl text-[17px]"
                    onClick={() => {setIsCommentBoxOpen(true); form.reset(); setImageUrl(null);}}
                    >
                      Cancel
                    </Button>

                    <Button type="submit" variant="outline" className=" rounded-3xl text-[17px]"
                    >
                      Post
                    </Button>
                  </div>
                  
                </form>
              </Form>
            </div>
          )}
        </div>

        <div>
              {eventComment.map((comment, index) => (
              <EventCommentPost key={index} eventComment={comment} />
            ))}
        </div>



        </div>


       <div className="w-[21.3rem] top-0 h-fit md:hidden lg:block">

       <div className='mt-[4rem] sm:block hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300'>
          <Card x-chunk="dashboard-01-chunk-5">
              <CardContent className="mt-[1.5rem]">
                <div className='text-[18px]'><span className='font-[700] mr-[1rem]'>Pre-Conference Date :</span><span>{eventObject.preConferenceDate}</span></div>
                <div className='text-[18px]'><span className='font-[700]  mr-[1rem]'>Registration Start Date :</span><span>{eventObject.registrationStartDate}</span></div>
                <div className='text-[18px]'><span className='font-[700]  mr-[1rem]'>Registration End Date :</span><span>{eventObject.registrationEndDate}</span></div>
                <div className='text-[18px]'><span className='font-[700] mr-[1rem]'>Early Bird Registration Fee :</span><span>{eventObject.earlyBirdRegistrationFee}</span></div>
                <div className='text-[18px]'><span className='font-[700]  mr-[1rem]' >Late Registration Fee :</span><span>{eventObject.lateRegistrationFee}</span></div>
                <div className='text-[18px]'><span className='font-[700]  mr-[1rem]'>Contact Number :</span><span>{eventObject.contactNumber}</span></div>
              </CardContent>
          </Card>
        </div>

        <div className='mt-3 sm:block hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300'>
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle className='text-[24px] font-[500]'>Created By</CardTitle>
              <div className='text-xs text-muted-foreground'>Moderator/Creator of this event.</div>
            </CardHeader>
            <CardContent className="">

            <div className="flex mb-1">
              <div>
            <Image
                        src={userData.profilePic?userData.profilePic:PImage}
                        width={250}
                        height={250}
                        alt='Conference'
                        className=' w-10 h-10 rounded-full'
                        />
            </div>  
          <div className="ml-4 space-y-1">
          <p className="text-[17px] font-medium leading-none">{userData.name?userData.name:"Guest"}</p>
            <p className="text-[17px] text-muted-foreground">{userData.email?userData.email:"na"}</p>
          </div>
          <div className="ml-auto font-medium"></div>
        </div>
              
            </CardContent>
          </Card>
        </div>

        <div className='mt-3 sm:block hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300'>
          <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader className='text-sm pb-1'>
                <CardTitle className="text-[24px] font-[500]">Register</CardTitle>
                <div className='text-xs text-muted-foreground'>Verify the third-party sites before entering data.</div>
              </CardHeader>
              <CardContent className="mt-2">
                <p className=' text-[17px]'>Register for this event on a single click</p>
                <div className=' flex items-end justify-end mt-4'>
                  <Button className=' w-full text-[17px]'><a target='_blabk' href="#">Register now</a></Button>
                </div>
              </CardContent>
          </Card>
        </div>

        <div className='mt-3 sm:block hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300'>
          <Card x-chunk="dashboard-01-chunk-5">
              <CardHeader>
                <CardTitle className='text-[24px] font-[500]'>Credits</CardTitle>
                <div className='text-xs text-muted-foreground'>Few events comes with Govt. recognized credits. <span className='text-black'>Check Info*</span></div>
              </CardHeader>
              <CardContent className="">
                <h1 className=' text-[30px] flex items-center justify-center mx-auto text-[#311b92]'>
                  {
                    eventObject.creditPoints 
                    ?
                    eventObject.creditPoints
                    :
                    0
                  }
                </h1>
              </CardContent>
          </Card>
        </div>

        <div className=' sm:block mt-3 hidden col-span-2 sticky overflow-hidden h-fit rounded-2xl border border-gray-300 order-last'>
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle className='text-[24px] font-[500]'>Sponsors</CardTitle>
              <div className='text-xs text-muted-foreground'>Either sponsoring this event or this post.</div>
            </CardHeader>
            <CardContent className="grid gap-8 uppercase">

              {eventObject.sponsors?(
                eventObject.sponsors.map((sponsor, index)=>{
                  return <div key={index} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback><Building/></AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-[17px] font-medium leading-none">
                      {sponsor}
                    </p>
                  </div>
                </div>
                }
                )
              ):<div>No Sponsors Found...</div>
            }
              
            </CardContent>
          </Card>
        </div>


        </div>
    </div>
  )
}

export default EventDetailsPage