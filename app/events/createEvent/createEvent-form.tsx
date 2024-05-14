"use client";

import { Metadata } from "next"
import Image from "next/image"
import { useRouter } from "next/navigation";

import { PlusCircleIcon } from "lucide-react"
import { X } from 'lucide-react';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { AlbumArtwork } from "@/app/events/components/album-artwork"
import { listenNowAlbums, madeForYouAlbums } from "@/app/events/data/albums"
import { playlists } from "@/app/events/data/playlists"
import { Sidebar } from "@/app/events/components/sidebar"

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { postData } from "@/lib/data";

import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader"

import { db , storage} from "@/utils/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref , uploadBytes, uploadBytesResumable , getDownloadURL} from "firebase/storage";
import imageCompression from 'browser-image-compression';


import styled, { createGlobalStyle } from "styled-components";

import { LuXCircle } from "react-icons/lu";


import { useDispatch, UseDispatch } from "react-redux";
import { setEventId } from "@/store/slice";

import { DialogClose } from "@radix-ui/react-dialog";

import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast";


import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
import { doc  } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { Tiptap } from "@/components/TipTapAns";


import { EventType } from "@/schemas/event";
import { title } from "process";

type Input = z.infer<typeof EventType>;

type Props = {
  newPost: boolean;
};

type EventType = {
    id: string;
    title: string;
    description: string;
    eventImageURL: string;
    dateOfEvent: string;
    locationOfEvent: string;
    durationOfEvent: number;
    registrationLink: string;
    uid: string;
    createdAt: string;
    name: string;
    profilePic: string;
    sponsors: string[];

    preConferenceDate: string;
    registrationStartDate: string;
    registrationEndDate: string;
    earlyBirdRegistrationFee: number;
    lateRegistrationFee: number;
    creditPoints: number;
    contactNumber: number;
  };

const CustomContainer = styled.div`
  height: 100%;
  padding-top: 1rem;
  `;

const CreatEventPage = () => {

    const router = useRouter();
    const { toast } = useToast();
    const [user , loading] = useAuthState(auth);
    
    //for sending the eventId in additionalInformation-form
    const dispatch = useDispatch();

    const form = useForm<Input>({
        resolver: zodResolver(EventType),
        defaultValues: {
          title: "",
          description: "",
          eventImageURL: "",
          // dateOfEvent: 0000/00/00,
          locationOfEvent: "",
          landmarkLocationOfEvent: "",
          // durationOfEvent:,
          registrationLink: "",
          sponsors: [],
        },
      });
    
      const [isFocused, setIsFocused] = useState(false);
    
      type SelectedCategoriesType = Record<string, string[]>;
      //image uploading
      const [imageUpload , setImageUpload] = useState<File | null>(null);
      const [imageUrl, setImageUrl] = useState<string | null>(null);
      const [selectC, setSelectC] = useState<any>([]);
      const [selectedCategories, setSelectedCategories] = useState<SelectedCategoriesType>({});
      const [selectedMainCategory, setSelectedMainCategory] = useState('');
      const [selectedSubcategory, setSelectedSubcategory] = useState('');
      const [progress , setProgress] = useState<number | null>(0);
      const [previewImg, setPreviewImg] = useState<any>(null);
      const [subCategoryy, setSubCategoryy] = useState<any>(["SubCategory1", "SubCategory2", "SubCategory3"]);
      const [tempSubCategory, setTempSubCategory] = useState<any>([]);
      const [selectCategory, setSelectCategory] = useState<any>();
      const [sponsors , setSponsors] = useState<string[]>([]);
      const [sponsorInput , setSponsorInput] = useState<string>("");
      const [landmark, setLandmark] = useState<string>("");
      const [eventMode, setEventMode] = useState<string>("");
    
    
       //old homepage stuff
       const [posts, setPosts] = useState<EventType[]>([]);
       const limitValue: number = 8;
       const [lastDoc, setLastDoc] = useState<any>(null);
       const [loadMore, setLoadMore] = useState<any>(null);
       const [isLoading, setIsLoading] = useState(false);
       const [pageLoaded, setPageLoaded] = useState(false);
       const [reload, setReload] = useState(false);
       const [addFirst, setAddFirst] = useState(false);
       const [morePosts, setMorePosts] = useState(true);
     
       const [selectedCategory, setSelectedCategory] = useState<string | undefined>('all');
     
       const handleSelectChange = (newValue: string | undefined) => {
         setPosts([]);
         setLastDoc(null);
         setMorePosts(true);
         setSelectedCategory(newValue);
         console.log(selectedCategory);
       };
     
       //for automating loadmore lazy load button ...
       const loadMoreButtonRef = useRef<HTMLDivElement>(null);
     
       //extracting all events from the events collection using onSnapshot in a function
       const getPosts = () => {
        setIsLoading(true);
        const q = query(
          collection(db, "events"),
          // where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          limit(limitValue)
        );
      
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const docs = querySnapshot.docs;
          const lastDoc = docs[docs.length - 1];
          setLoadMore(lastDoc);
          const posts = docs.map((doc) => doc.data() as EventType);
          setPosts(posts);
          setIsLoading(false);
          setPageLoaded(true);
        });
      
        // Detach the listener when the component unmounts
        return unsubscribe;
      };
      
      // useEffect(() => {
      //   const unsubscribe = getPosts();
      //   return () => unsubscribe();
      // }, []);
    
      //extracting ends 
       
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
        setSelectCategory(categories);
      }).catch(error => {
        console.error('Error:', error);
      });
      }, [])

      //new fetchpost
      useEffect(() => {
     
        //console.log("Last Doc ", lastDoc);
        setIsLoading(true);
      const collectionRef = collection(db, "events");
      let q;
    
      if (selectedCategory === "all") {
        if (lastDoc) {
          q = query(
            collectionRef,
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(limitValue)
          );
        } else {
          q = query(collectionRef, orderBy("createdAt", "desc"), limit(limitValue));
        }
      } else {
        if (lastDoc) {
          q = query(
            collectionRef,
            where("category", "array-contains", selectedCategory),
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(limitValue)
          );
        } else {
          q = query(
            collectionRef,
            where("category", "array-contains", selectedCategory),
            orderBy("createdAt", "desc"),
            limit(limitValue)
          );
        }
      }
      
      //const postLength = 0;
      const unsub = onSnapshot(q, async (snapshot) => {
        const postsData:any = [];
        if(snapshot.docs.length<limitValue){
          console.log("Length ", snapshot.docs.length);
          setMorePosts(false);
        }
        else{
          setMorePosts(true);
        }
    
        const posts = snapshot.docs.map((doc) => doc.data() as EventType);
    
        const lastDocument = snapshot.docs[snapshot.docs.length - 1];
        setLoadMore(lastDocument);
    
        if (addFirst && lastDoc == null) {
          setPosts(posts);
          setAddFirst(false);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...posts]);
        }
        setIsLoading(false);
        setPageLoaded(true);
      });
    
      return () => {
        unsub();
      };
    
      }, [lastDoc, reload , selectedCategory]);
    
      const categorySelect = async()=>{
        setPosts([]);
        setLastDoc(null);
    
      }
      //new fetchpsot ends
    
       //image uploading stuff
       const uploadImage = async(file: any) => {
        if(file == null) return;
    
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
    
        //uploading compressed file
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);
    
        uploadTask.on('state_changed', 
        (snapshot:any) => {
          // You can use this to display upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          setProgress(progress);
          
        }, 
        (error: any) => {
          // Handle unsuccessful uploads
          console.log('Upload failed', error);
          toast({
            title: "Upload Failed",
            variant: "destructive",
            description: "Your image could not be uploaded.",
          })
        }, 
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            // Save the URL to state or wherever you want to keep it
            setImageUrl(downloadURL);
    
            form.setValue('eventImageURL', downloadURL);
            toast({
              title: "Image Uploading",
              variant: "feature",
              description: `Your image is 100% uploaded.`,
            })
          });
        }
      );}catch(err){
        console.error('Error compressing or uploading image:', err);
      }
    
      }
    
      const handleImageFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          setImageUpload(event.target.files[0]);
          uploadImage(event.target.files[0]);
        }
      };

      const handleEventModeChange = (newValue: string) => {
        console.log(newValue);
        setEventMode(newValue);
      };
    
      //category stuff
    
      const handleMainCategoryChange = (newValue: string) => {
        setTempSubCategory([]);
        if(!selectC.includes(newValue)){
          setSelectC((prev:any)=>{
            return [...prev, newValue]
          })
        }
        setSelectedMainCategory(newValue);
        handleCategorySelectChange(newValue, undefined);
      };
    
      const handleSubcategoryChange = (newValue: string) => {
        if(!tempSubCategory.includes(newValue)){
          setTempSubCategory((prev:any)=>{
            return [...prev, newValue]
          })
        }
        handleCategorySelectChange(selectedMainCategory, newValue);
        setSelectedSubcategory(newValue);
      };
    
      const handleCategorySelectChange = (category: string, subcategory: string | undefined) => {
        setSelectedCategories((prev: any) => {
          const updatedCategories = { ...prev };
          if (!updatedCategories[category]) {
            updatedCategories[category] = [];
          }
          if (subcategory && !updatedCategories[category].includes(subcategory)) {
            updatedCategories[category].push(subcategory);
          }
          return updatedCategories;
        });
        //console.log(selectedCategories);
      };
    
      const delCategories = (category:string)=>{
        let newCategory=selectC.filter((cat:any)=>{
          console.log(cat, " ", category);
          return cat!=category;
        })
      setSelectC(newCategory);
      delete selectedCategories[category]
      //console.log(selectedCategories);
      }
    
      const delSubCategories = (category:string)=>{
        let newSubCategory=tempSubCategory.filter((cat:any)=>{
          return cat!=category;
        })
      setTempSubCategory(newSubCategory);
      selectedCategories[selectedMainCategory]=selectedCategories[selectedMainCategory].filter((subcat)=>(
        subcat!=category
      ))
      //console.log(selectedCategories);
      }

      
      //create event
    
      async function createEventPost(data:Input)
      {
        const docRef = await addDoc(collection(db, 'events'), {
          title: data.title,
          description: data.description,
          eventImageURL: imageUrl,
          dateOfEvent: data.dateOfEvent,
          locationOfEvent: data.locationOfEvent,
          durationOfEvent: data.durationOfEvent,
          registrationLink: data.registrationLink,
          sponsors: sponsors,
          uid: user?.uid,
          eventMode: eventMode,
          category: selectC,
          createdAt: serverTimestamp(),
          name: user?.displayName,
          profilePic: user?.photoURL,
        });
    
        console.log("Event ID: ", docRef.id);
        const event_id = docRef.id

        //dispatch(setEventId(event_id)); 

        //storing value of eventId in sessional storage
          const devotionalEventId = sessionStorage.getItem('devotionalEventId');
        
          if (!devotionalEventId) {
            // If "devotionalEventId" is not already present, store "eventId"
            sessionStorage.setItem('devotionalEventId', event_id);
          } else {
            // If "devotionalEventId" is already present, update it with the new "eventId"
            sessionStorage.setItem('devotionalEventId', event_id);
          }
        
        try {
          for (const [mainCategory, subcategories] of Object.entries(selectedCategories)) {
            // Update Firestore for main category
            await updateDoc(doc(db, 'meta-data', 'v1', 'event-categories', mainCategory), {
              Events: arrayUnion(docRef.id),
            });
      
            // Update Firestore for each subcategory
            for (const subcategory of subcategories) {
              await updateDoc(doc(db, 'meta-data', 'v1', 'event-categories', mainCategory), {
                [subcategory]: arrayUnion(docRef.id),
              });
            }
          }
      
          // Clear selected categories after submission
          setSelectedCategories({});
        } catch (error) {
          console.error('Error updating Firestore:', error);
        }
    
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        })

        // router.push(`/event-details/${data.title}`);
        router.push(`/events/createEvent/additionalInformation`)
    
        try {
          console.log("keyword Gen.....")
          const docRef = await addDoc(collection(db, 'keywords'), {
            prompt: `Generate some keywords and hashtags on topic ${data.title} and give it to me in "**Keywords:**["Keyword1", "Keyword2",...] **Hashtags:**["Hashtag1", "Hashtag2",...]" this format`,
          });
          console.log('Keyword Document written with ID: ', docRef.id);
      
          // Listen for changes to the document
          const unsubscribe = onSnapshot(doc(db, 'keywords', docRef.id), async(snap) => {
            const data = snap.data();
            if (data && data.response) {
              console.log('RESPONSE: ' + data.response);
              const keywordsStr = `${data.response}`;
    
              const cleanedString = keywordsStr.replace(/\*|\`/g, '');
    
              const splitString = cleanedString.split("Keywords:");
              const keywordsString = splitString[1].split("Hashtags:")[0].trim();
              const hashtagsString = splitString[1].split("Hashtags:")[1].trim();
    
              const keywordsArray = JSON.parse(keywordsString);
              const hashtagsArray = JSON.parse(hashtagsString);
    
              const questionDocRef = doc(db, 'events', event_id);
              await updateDoc(questionDocRef, {
              keywords: keywordsArray,
              hashtags: hashtagsArray // Add your keywords here
          });
            }
          });
      
          // Stop listening after some time (for demonstration purposes)
          setTimeout(() => unsubscribe(), 60000);
        } catch (error) {
          console.error('Error adding document: ', error);
        }
    
      }
    
      function onSubmit(data: Input) {
        // eventImageURL: imageUrl;
        // console.log(imageUrl)
        // console.log(data);

        // data.locationOfEvent = `${data.locationOfEvent}, ${landmark}`;
    
        createEventPost(data);
    
        // toast({
        //   title: "You submitted the following values:",
        //   description: (
        //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        //     </pre>
        //   ),
        // })
        
      }
     
     
       
     
       const loadMoreData = () => {
         setLastDoc(loadMore);
       };
     
       useEffect(()=>{
        const getCat=async()=>{
        //fetch all categories
      }
      getCat();
      }, [])
    
       //useEffect for automting lazyload functionality
       useEffect(() => {
         if(morePosts){
         const observer = new IntersectionObserver(
           (entries) => {
             if (entries[0].isIntersecting) {
               loadMoreData();
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
       }, [loadMoreButtonRef, loadMoreData]);

  return (
    <>
      <div className="w-full font-dmsans">
        <div className=" w-full">
          <div className="bg-background w-full">
            <div className=" w-full">
            {/* <Sidebar playlists={playlists} selectChange={handleSelectChange} currentC={selectedCategory||"all"} className="hidden lg:block" /> */}
              <div className="w-full px-0 ">
                    {/* <div className="flex items-center justify-between ">

                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold tracking-tight">
                            Create Your Event
                          </h2>
                          <p className="text-sm text-muted-foreground">
                          Enrich your spiritual journey through TheGodSays. Ask, seek, answer, and grow.
                          </p>
                        </div>
                    </div>
                    <Separator className="my-2" /> */}


                <div className=" w-full px-0 ">
                    <div className="">
                      
                      <div className="">
                      <div className="">
        
                    
                      {/* <Tiptap /> */}
                     {/* <Textarea className="w-full min-h-[500px]" placeholder="What's your question?" /> */}

                      <div className="  rounded-3xl  cursor-pointer">
                      <Form {...form}>
                        <form
                        className="relative space-y-8 "
                        onSubmit={form.handleSubmit(onSubmit)}
                        >

                          {/* Title */}
                          <FormField
                          control={form.control}
                          name="title"
                          render = {({field}) => (
                            <FormItem>
                              <FormLabel className="text-[17px]">Title</FormLabel>
                              <FormControl>
                                <Input className="" placeholder="Title for the Event ..." {...field}/>
                              </FormControl>
                              <div className="text-[12px] opacity-70">This is the title, write your question here.</div>
                              <FormMessage/>
                            </FormItem>
                          )}
                          />

                          {/* EventImage */}
                          <FormField
                          control={form.control}
                          name="eventImageURL"
                          render = {({field}) => (
                            <FormItem>
                              <FormLabel className="text-[17px]">Event Image</FormLabel>
                              <FormControl>
                                
                                <Input
                                type="file"
                                onChange={handleImageFileSelect}

                                />
                              </FormControl>
                              <div className="text-[12px] opacity-70">Upload an image for the Event.</div>
                              <FormMessage/> 
                            </FormItem>
                          )}
                          />

                          {/* TipTap Editor */}
                          <FormField
                            control={form.control}
                            name="description"
                            render = {({field}) => (
                              <FormItem>
                                <FormLabel className="text-[17px]">Description</FormLabel>
                                <div className={`${isFocused?"border-black border-[2.1px]": "border-[1.2px]"} rounded-lg`} onFocus={() => setIsFocused(true)}
                                  onBlur={() => setIsFocused(false)}
                                  >
                                <FormControl>
                                  <Controller
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                      <Tiptap {...field} setImageUpload={setImageUpload} uploadImage={uploadImage} progress={progress} />
                                    )}
                                   /> 
                                </FormControl>
                                </div>
                                <div className="text-[12px] opacity-70">This is the description, give more details about your question here.</div>
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                          
                          {(progress||0)>0&&<span className='pt-3'>{`${Math.ceil((progress||0))} % Uploaded`}</span>}
                          {/* "0" to make upload percentage invisible when no image is selected */}
                          {/* anonymity toggle */}
                          <div>
                            {
                              previewImg&&<div className="w-full flex items-center justify-center">
                                <Image src={previewImg} alt="previewImage" width={250} height={250}/>
                              </div>
                            }
                          </div>

                          {/* Event Type */}
                          <div>
                          <div className="text-[17px] font-medium mb-2">Event Type</div>
                          <Select value={eventMode} onValueChange={handleEventModeChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Event Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Event Mode</SelectLabel>
                                <SelectItem value="Webinar">Webinar</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          </div>
                          {/*Category thing*/}
                          <div>
                          
                          <div className="text-[17px] font-medium mb-2">Category</div>
                          <Select value={""} onValueChange={handleMainCategoryChange} >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Categories</SelectLabel>
                                <div>
                                  {
                                    selectCategory?
                                    selectCategory.map((categoryD:any, index:any)=>(
                                      <div key={index}>
                                        <SelectItem value={categoryD.id}>{categoryD.id.split("|").join("/")}</SelectItem>
                                      </div>
                                    )):
                                    <div><Loader/></div>
                                  }
                                </div>
                                <SelectItem value="Others">Others</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="flex">
                              {
                                selectC.map((category:string, index:number)=>{
                                  return <span className='bg-slate-300 text-slate-800 rounded-xl p-1 text-sm flex mr-1 mt-3' key={index}>{category.split("|").join("/")} <span onClick={()=>{delCategories(category)}} className="mt-[0.27rem] ml-1 cursor-pointer text-slate-800 hover:text-slate-900"><LuXCircle /></span></span>
                                })
                              }
                            </div>
                            {/* Ls */}
                            <div className="mt-3">
                            {selectedMainCategory && (
                              <Select value={""} onValueChange={handleSubcategoryChange}>
                                <SelectTrigger>
                                <SelectValue placeholder={`Select subCategory for ${selectedMainCategory.split("|").join("/")}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                  <SelectLabel>Sub Categories</SelectLabel>
                                    {
                                      subCategoryy.map((subcategory:any, index:any)=>(
                                        <SelectItem key={index} value={subcategory}>{subcategory}</SelectItem>
                                      ))
                                    }
                                    {/* Add more subcategories for other main categories */}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                            <div className="flex">
                              {
                                tempSubCategory.map((subcategory:string, index:number)=>{
                                  return <span className='bg-slate-300 text-slate-800 rounded-xl p-1 text-sm flex mr-1 mt-3' key={index}>{subcategory} <span onClick={()=>{delSubCategories(subcategory)}} className="mt-[0.27rem] ml-1 cursor-pointer text-slate-800 hover:text-slate-900"><LuXCircle /></span></span>
                                })
                              }
                            </div>
                            </div>
                            {/* */}
                            <div className="text-[12px] opacity-70 mt-[0.45rem]">This is the category, you can choose multiple categories for your Question.</div>
                          </div>
                          {/* DateOfEvent */}
                          <FormField
                              control={form.control}
                              name="dateOfEvent"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-[17px]">Date of Event</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        // disabled={(date) =>
                                        //   date > new Date() || date < new Date("1900-01-01")
                                        // }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  {/* <FormDescription>
                                    This is the date of the event.
                                  </FormDescription> */}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                          {/* Location of the Event */}
                          <FormField
                          control={form.control}
                          name="locationOfEvent"
                          render = {({field}) => (
                            <div className=" flex-col space-y-1">
                                <FormItem>
                                    <FormLabel className="text-[17px]">Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main location of the Event" 
                                        {...field}
                                        />
                                    </FormControl>
                                {/* <div className="text-[12px] opacity-70">This is the location of the event.</div> */}
                                <FormMessage/>
                                </FormItem>

                                {/* <FormItem>
                                    <FormLabel className="">Landmark</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Landmark of the event location" value={landmark} onChange={(e) => setLandmark(e.target.value)}/>
                                    </FormControl>
                                    <FormMessage/>
                                    </FormItem> */}
                            </div>
                            
                            
                          )}
                          />

                          <FormField
                          control={form.control}
                          name="durationOfEvent"
                          render={({field}) => (
                            <FormItem>
                              <FormLabel className="text-[17px]">Duration of the Event</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Duration of the Event (in hours)" {...field}
                                min={1}
                                max={24}
                                onChange={(e) => {
                                  form.setValue('durationOfEvent', parseInt(e.target.value))
                                }}
                                />
                              </FormControl>
                              {/* <div className="text-[12px] opacity-70">This is the duration of the event.</div> */}
                              <FormMessage/>
                            </FormItem>
                          )}
                          />

                          <FormField
                          control={form.control}
                          name="registrationLink"
                          render = {({field}) => (
                            <FormItem>
                              <FormLabel className="text-[17px]">Registration Link</FormLabel>
                              <FormControl>
                                <Input placeholder="Registration Link ..." {...field}/>
                              </FormControl>
                              {/* <div className="text-[12px] opacity-70">This is the registration link for the event.</div> */}
                              <FormMessage/>
                            </FormItem>
                          )}
                          />

                          {/* //spnosors section */}
                          {/* <FormField
                          control={form.control}
                          name="sponsors"
                          render={({field}) => (
                            <FormItem>
                              <FormLabel>Sponsors</FormLabel>
                              <FormControl>
                                <div className=" flex gap-2">
                                <Input
                                  placeholder="Sponsors"
                                  value={sponsorInput}
                                  onChange={(e) => setSponsorInput(e.target.value)}
                                  onKeyUpCapture={(e) => {
                                    if (e.key === 'Enter') {
                                      setSponsors((prev) => [...prev, sponsorInput]);
                                      setSponsorInput('');
                                    }
                                  }}
                                />
                                <Button
                                type="button"
                                onClick={() => {
                                  setSponsors((prev) => [...prev, sponsorInput]);
                                  setSponsorInput('');
                                }}
                                >Add</Button>
                                </div>
                              </FormControl>

                             <div className=" flex gap-2">
                              {sponsors.map((sponsor, index) => (
                                <div key={index} className=" flex gap-1 p-2 rounded-3xl bg-[#F6F6F7]">
                                  <p>{sponsor}</p>
                                  <button type="button" onClick={() => {
                                    const newSponsors = [...sponsors];
                                    newSponsors.splice(index, 1);
                                    setSponsors(newSponsors);
                                  }}>
                                    <X/>
                                  </button>
                                </div>
                              ))}
                              </div>

                              <div className="text-[12px] opacity-70">Add sponsors for the event.</div>
                              <FormMessage/>
                            </FormItem>
                          )}
                          /> */}

                            <Button type="submit" 
                                className=" w-full text-[17px]"
                                // disabled={isGuest === 'true'}
                              >
                                Post
                              </Button>
                          

                        </form>
                      </Form>
                      </div>

                      {/* <div>
                        <input type="file" onChange={(event) => {
                          if(event.target.files) {
                            setImageUpload(event.target.files[0]);
                          }
                        }}/>
                        <Button onClick={uploadImage}>Upload Image</Button>
                        <Progress value={progress} className=" w-[70%]"/>
                      </div> */}

                    
                  
              
            </div>
                      </div>
                    </div>
                    
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  )
}

export default CreatEventPage