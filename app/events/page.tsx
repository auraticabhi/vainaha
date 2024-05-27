"use client";

import { Metadata } from "next"
import Image from "next/image"
import { Layers3, MailIcon, MapPin, PlusCircleIcon } from "lucide-react"
import { X } from 'lucide-react';

import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area"
import { Separator } from "../../components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

import { AlbumArtwork } from "./components/album-artwork"
import { listenNowAlbums, madeForYouAlbums } from "./data/albums"
import { playlists } from "./data/playlists"
import { Sidebar } from "./components/sidebar"
import BImage from "../../public/richard-horvath-cPccYbPrF-A-unsplash.jpg"

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { postData } from "@/lib/data";

import { Button } from "../../components/ui/button";
import Loader from "../../components/ui/Loader"

import { db , storage} from "@/utils/firebase";
import {
  addDoc,
  and,
  arrayUnion,
  collection,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref , uploadBytes, uploadBytesResumable , getDownloadURL} from "firebase/storage";
import imageCompression from 'browser-image-compression';


import styled, { createGlobalStyle } from "styled-components";

import { LuXCircle } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { format, set } from "date-fns"
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

//for algolia event search
import algoliasearch from "algoliasearch/lite";
import { useSelector , useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setEventSearchText, triggerEventSearch } from "@/store/slice";


import { EventType } from "@/schemas/event";
import { title } from "process";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";
import { FaCirclePlus } from "react-icons/fa6";

type Input = z.infer<typeof EventType>;

type Props = {
  newPost: boolean;
};

// type PostType = {
//   id: string;
//   name: string;
//   title: string;
//   description: string;
//   profilePic: string;
//   postImage: string;
//   likes: number;
//   shares: number;
//   comments: number;
//   questionImageURL: string;
//   createdAt: string;
//   anonymity: boolean;
//   ansNumbers: number;
//   uid:string;
//   // Add any other fields as necessary
// };

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

const CustomContainer = styled.div`
  height: 100%;
  padding-top: 1rem;
  `;

export default function MusicPage() {

  const { toast } = useToast();
  const [user , loading] = useAuthState(auth);

  const form = useForm<Input>({
    resolver: zodResolver(EventType),
    defaultValues: {
      title: "",
      description: "",
      eventImageURL: "",
      // dateOfEvent: 0000/00/00,
      locationOfEvent: "",
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

  const [sponsors , setSponsors] = useState<string[]>([]);
  const [sponsorInput , setSponsorInput] = useState<string>("");

  const [eventModeChange, setEventModeChange] = useState<string>("Webinar");
  const searchTextI = useSelector((state: RootState) => state.eventSearch.searchText);
  const handleEventSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    dispatch(setEventSearchText(e.target.value));
  }

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
        or(
        where("eventMode", "==", eventModeChange),
        where("eventMode", "==", "Others"),
        ),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(limitValue)
      );
    } else {
      q = query(collectionRef, or(where("eventMode", "==", eventModeChange), where("eventMode", "==", "Others"),), orderBy("createdAt", "desc"), limit(limitValue));
    }
  } else {
    if (lastDoc) {
      q = query(
        collectionRef,
        and(
          or(
        where("eventMode", "==", eventModeChange),
        where("eventMode", "==", "Others"),
          ),
        where("category", "array-contains", selectedCategory)),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(limitValue)
      );
    } else {
      q = query(
        collectionRef,
        and(
          or(
        where("eventMode", "==", eventModeChange),
        where("eventMode", "==", "Others"),
          ),
        where("category", "array-contains", selectedCategory)),
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
 
    const posts:any = [];
    for (const doc of snapshot.docs) {
      const eventData = {
        id: doc.id,
        ...doc.data(),
      };

      posts.push(eventData);
    }


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

  }, [lastDoc, reload , selectedCategory, eventModeChange]);

  //offline event fetching
  // useEffect(()=>{
  //   if(eventModeChange=="Offline"){
  //     //console.log("Last Doc ", lastDoc);
  //     setIsLoading(true);
  //   const collectionRef = collection(db, "events");
  //   let q;
  
  //   if (selectedCategory === "all") {
  //     if (lastDoc) {
  //       q = query(
  //         collectionRef,
  //         where("eventMode", "==", "Offline"),
  //         orderBy("createdAt", "desc"),
  //         startAfter(lastDoc),
  //         limit(limitValue)
  //       );
  //     } else {
  //       q = query(collectionRef, where("eventMode", "==", "Offline"), orderBy("createdAt", "desc"), limit(limitValue));
  //     }
  //   } else {
  //     if (lastDoc) {
  //       q = query(
  //         collectionRef,
  //         and(
  //         where("eventMode", "==", "Offline"),
  //         where("category", "array-contains", selectedCategory)),
  //         orderBy("createdAt", "desc"),
  //         startAfter(lastDoc),
  //         limit(limitValue)
  //       );
  //     } else {
  //       q = query(
  //         collectionRef,
  //         and(
  //         where("eventMode", "==", "Offline"),
  //         where("category", "array-contains", selectedCategory)),
  //         orderBy("createdAt", "desc"),
  //         limit(limitValue)
  //       );
  //     }
  //   }
    
  //   //const postLength = 0;
  //   const unsub = onSnapshot(q, async (snapshot) => {
  //     const postsData:any = [];
  //     if(snapshot.docs.length<limitValue){
  //       console.log("Length ", snapshot.docs.length);
  //       setMorePosts(false);
  //     }
  //     else{
  //       setMorePosts(true);
  //     }
   
  //     const posts:any = [];
  //     for (const doc of snapshot.docs) {
  //       const eventData = {
  //         id: doc.id,
  //         ...doc.data(),
  //       };
  
  //       posts.push(eventData);
  //     }
  
  
  //     const lastDocument = snapshot.docs[snapshot.docs.length - 1];
  //     setLoadMore(lastDocument);
  
  //     if (addFirst && lastDoc == null) {
  //       setPosts(posts);
  //       setAddFirst(false);
  //     } else {
  //       setPosts((prevPosts) => [...prevPosts, ...posts]);
  //     }
  //     setIsLoading(false);
  //     setPageLoaded(true);
  //   });
  
  //   return () => {
  //     unsub();
  //   };

  // }
  
  // }, [lastDoc, reload , selectedCategory, eventModeChange]);

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
      category: selectC,
      createdAt: serverTimestamp(),
      name: user?.displayName,
      profilePic: user?.photoURL,
    });

    console.log("Event ID: ", docRef.id);
    const event_id = docRef.id
    
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

    createEventPost(data);

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
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


   //algolia stuff

  const dispatch = useDispatch();

   const [searchResult , setSearchResult] = useState<any>([]);

   const searchClient = algoliasearch("TEHQHAQR16" , "580c422314cda0e19c4f329d1a0efef3");

   const searchIndex = searchClient.initIndex("search_events");

   const { searchText , searchTriggered } = useSelector((state: RootState) => state.eventSearch);

   const handleSearch = async(queryText: string) => {
    try {
      const result = await searchIndex.search(queryText);
      setSearchResult(result.hits);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResult(null);
      
    }
   }

   useEffect(() => {
    if (searchText === "") {
      setSearchResult(null);
    }
  }, [searchText]);

  useEffect(() => {
    if (searchTriggered) {
      handleSearch(searchText);
      dispatch(triggerEventSearch());
    }
  }, [searchTriggered]);


  function transformHitToPost(hit: any) {
    return{
      id: hit.objectID,
      title: hit.title,
      description: hit.description,
      eventImageURL: hit.eventImageURL,
      dateOfEvent: hit.dateOfEvent,
      locationOfEvent: hit.locationOfEvent,
      durationOfEvent: hit.durationOfEvent,
      registrationLink: hit.registrationLink,
      uid: hit.uid,
      createdAt: hit.createdAt,
      category: hit.category,
      name: hit.name,
      profilePic: hit.profilePic,
      sponsors: hit.sponsors,
    }
  }

  const [sidebarCategory, setSidebarCategory] = useState<any>([]);

  const handleLocationChange = (event:any)=>{
    const value = event.target.value;
    setLocation(value); 
  }

  const handleChangeCat = (event:any)=>{
    const value = event.target.value;
    handleSelectChange(value);
  }

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

  const [location, setLocation] = useState("all");
  const locations:any = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
   
  return (
    <>
      <div className="w-full font-jakarta">
      <Image
              src={BImage}
              alt="BannerImage"
              width={1800}
              height={1000}
              className={cn(
                "h-full w-full object-cover",
              )}
            />
            <h1 className="lg:top-[18.5rem] top-[6rem] left-[1rem] font-jakarta eventSubHeading lg:left-[12rem] absolute text-[27px] lg:text-[30px] font-[700] italic text-pink-500">Find Your Next Experience</h1>
            <h1 className="lg:top-[22rem] lg:left-[12rem] top-[9rem] font-jakarta left-[1rem] eventHeading absolute [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] text-[35px] leading-9 lg:text-[55px] font-[800] lg:w-[60rem] lg:leading-[50px] text-white">Discover & Promote Upcoming Event</h1>
            <div className="hidden lg:block h-[5rem] top-[34rem] w-[65rem] bg-white absolute left-[12rem] rounded-2xl">
            <div className="search-box absolute top-[11.5px] left-[1rem]">
              
          {/* <Input className=" pl-10 w-[40rem]" placeholder="Search" /> */}
          <input type="text" 
            value={searchTextI}
            onChange={handleEventSearchText}
            placeholder="Search Events" 
            className="peer cursor-pointer relative h-14 w-30 text-black pl-[53px] rounded-2xl bg-white outline-none focus:ml-[0rem] focus:cursor-text focus:border-[#ffffff] transition-all" 
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  dispatch(triggerEventSearch());
                }
            }}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className={`absolute top-[10px] left-[13px] transition-all h-9 w-7 border-transparent text-black`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        </div>
        <div className="absolute mt-[26.5px] left-[16rem]"><Layers3/></div>
        <div className="absolute top-[11.5px] left-[18rem] w-[12rem] h-[62px] font-[19px]">
      <form className="max-w-sm mx-auto">
        <label htmlFor="countries" className="mb-2 text-sm font-medium text-gray-900 dark:text-white hidden">
          Select an option
        </label>
        <select
          id="countries"
          className={`mt-[8px] h-full text-slate-400 text-base rounded-lg block w-full p-2.5 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
            selectedCategory ? 'border-none' : ''
          }`}
          value={selectedCategory}
          onChange={handleChangeCat}
        >
          <option value="all" selected>
            Choose a Category
          </option>
          <option value="all">All</option>
          {sidebarCategory &&
            sidebarCategory.map((categoryD:any, index:any) => (
              <option key={index} value={categoryD.id}>
                {categoryD.id.split('|').join('/')}
              </option>
            ))}
        </select>
      </form>
    </div>
    <div className="absolute mt-[26.5px] left-[514px]"><MapPin/></div>
        <div className="absolute top-[11.5px] left-[546px] w-[12rem] h-[62px] font-[19px]">
      <form className="max-w-sm mx-auto">
        <label htmlFor="location" className="mb-2 text-sm font-medium text-gray-900 dark:text-white hidden">
          Select an option
        </label>
        <select
          id="location"
          className={`mt-[8px] h-full text-slate-400 text-base rounded-lg block w-full p-2.5 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
            location ? 'border-none' : ''
          }`}
          value={location}
          onChange={handleLocationChange}
        >
          <option value="all" selected>
            Choose a location
          </option>
          <option value="all">World Wide</option>
          { locations&&
            locations.map((location:any, index:any) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
        </select>
      </form>
    </div>
    <div>
    <svg xmlns="http://www.w3.org/2000/svg" className={`absolute top-[17px] left-[60.5rem] bg-purple-600 p-3 rounded-full transition-all h-[3rem] w-[3rem] border-transparent text-white hover:cursor-pointer`} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        </div>
            </div>
      </div>
      <div className="lg:container lg:max-w-[93.5rem] lg:mx-auto font-dmsans mt-[1rem] lg:mt-[5rem]">
      <div className="mb-8">
        <div className="font-[700] text-[32px] text-center text-red-500 italic">Upcoming Events</div>
        <div className="lg:text-[46px] text-[37px] font-[900] text-center">Featured Events</div>
      </div>
      <div className="flex flex-col lg:mx-[9.5rem]">
                          <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-[1rem] pb-4">
                            {searchResult && searchResult.length > 0 ?(
                              searchResult.map((hit: any) => {
                                const post = transformHitToPost(hit);
                                return (
                                  <div key={post.id} className="mb-1">
                                    <AlbumArtwork
                                      post={post}
                                    />
                                  </div>
                                );
                              })
                            ):(
                              posts.map((post, index) => (
                                <div key={index} className="mb-3 mx-auto md:mx-0">
                              <AlbumArtwork
                                post={post}
                              />
                              </div>
                            ))
                        
                            )
                            }

                            
                          </div>
                          <div className="mb-5">
                            <div className='w-[100]'>
                            { isLoading?<Loader/>:pageLoaded&&
                            <div ref={loadMoreButtonRef} className='mt-4'>
                              <button onClick={loadMoreData}></button>
                            </div>
                            }
                            </div>
                          <div className="w-full text-center mt-0">{!isLoading&&!morePosts&&<div>No more Posts...</div>}</div>
                          </div>
                      </div>
      </div>
    </>
  )
}