import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

import React, { useEffect, useState } from 'react'
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { auth, db, storage } from "@/utils/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useAuthState } from "react-firebase-hooks/auth";
import algoliasearch from "algoliasearch/lite";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Loader from "./ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tiptap } from "./TipTapAns";
import { Controller, useForm } from "react-hook-form";
import { QuestionType } from "@/schemas/question";
type Input = z.infer<typeof QuestionType>;

function AskQuestion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('isGuest');
  const [user, loading] = useAuthState(auth);
  const [newPost, setNewPost] = useState(false);

  //system image upload stuff
  const [imageUpload , setImageUpload] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress , setProgress] = useState<number | null>(0);

  const uploadImage = async(file: any) => {
    if(file == null) return;

    const storageRef = ref(storage, `questions/${file.name}`);

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
    }, 
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        // Save the URL to state or wherever you want to keep it
        setImageUrl(downloadURL);
      });
    }
  );}catch(err){
    console.error('Error compressing or uploading image:', err);
  }

  }

  useEffect(() => {
    if(!user && !loading)
      router.push('/auth');
  }, [user, loading , router])
  
  
  //algolsearchClientff
  
  const [searchClient, setSearchClient] = useState<any>(null);
  useEffect(() => {
    setSearchClient(algoliasearch('8XQGGZTFH3', 'bd743f217017ce1ea457a8febb7404ef'))
  } , [])

  // const client = algoliasearch('8XQGGZTFH3', 'bd743f217017ce1ea457a8febb7404ef')




  const [description, setDescription] = useState("");
  // console.log(description);

  const form = useForm<Input>({
    // mode: "onSubmit",
    // mode: "onChange",
    resolver: zodResolver(QuestionType),
    defaultValues: {
      title: "",
      description: "",
      questionImageURL: "",
      anonymity: false,
    },
  });

  async function createQuestionPost(data: Input) {

    const docRef = await addDoc(collection(db, "questions"), {
      title: data.title,
      description: data.description,
      uid: user?.uid,
      profilePic: user?.photoURL,
      name: user?.displayName,
      createdAt: serverTimestamp(),
      questionImageURL: imageUrl,
      anonymity: data.anonymity,
      // ansNumbers: 0,
    });

    console.log("Document written with ID: ", docRef.id);
    console.log(data);
  }

  function onSubmit(data: Input) {
    // console.log(data);

    createQuestionPost(data);
    setNewPost((prev)=>!prev);
    
  }

  const [searchTerm , setSearchTerm] = useState("");

  function transformHitToPost(hit: any) {
    return {
      id: hit.objectID, // Algolia provides an unique objectID for each record
      title: hit.title,
      name: hit.name,
      description: hit.description,
      profilePic: hit.profilePic,
      postImage: hit.postImage,
      likes: hit.likes,
      comments: hit.comments,
      shares: hit.shares,
      questionImageURL: hit.questionImageURL,
      createdAt: hit.createdAt,
      anonymity: hit.anonymity,
      // ansNumbers: hit.ansNumbers,
      // add other necessary fields
    };
  }

  const searchClasses = {
    root: 'flex flex-col space-y-2 ',
    form: 'flex flex-col space-y-2 ',
    input: 'w-full border border-gray-300 rounded-lg p-2 pl-10',
    // submit: 'bg-emerald-500 text-white rounded-lg p-2',
    submit: 'hidden',
    reset: 'hidden',
    // loadingIndicator: 'text-red-500',
    // submitIcon: 'h-5 w-5',
    // resetIcon: 'h-5 w-5',
    // loadingIcon: 'h-5 w-5',
  };

  // form.watch();

  if(loading)
  {
    return(
      <div className='w-[100%] lg:ml-64 md:ml-80 xl:ml-96 font-dmsans'>
        <Loader />
      </div>
    )
  }
  else {
  return (
    <div className="font-dmsans">
        <dl className='rounded-md divide-y divide-gray-100 border bg-[#FFFFFF] dark:bg-[#262626] border-gray-100  px-6 py-4 text-sm leading-6'>
            <div className='flex rounded-md justify-between md:min-h-[7.5rem] gap-x-4 py-3'>
              {
                isGuest === 'true' ? (
                  <p className=" text-zinc-500">
                    You are currently logged in as a Guest. To post question you need to have an account.
                  </p>
                ) : (
                <p className='text-zinc-500 font-semibold'>
                  Your personal Devotional frontpage. Come here to check in with your
                  favorite communities.
              </p>
                )
              }
            </div>

            <div>
              <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default"  className=" w-full" disabled={isGuest === 'true'}>Ask Question</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[925px] ">
                    <DialogHeader>
                      <DialogTitle>Post Question</DialogTitle>
                      <DialogDescription>
                        Create your question here. Click post when you are done.
                      </DialogDescription>
                    </DialogHeader>
                      {/* <Tiptap /> */}
                     {/* <Textarea className="w-full min-h-[500px]" placeholder="What's your question?" /> */}

                      <div className=" border border-gray-300 rounded-3xl p-4 cursor-pointer">
                      <Form {...form}>
                        <form
                        className="relative space-y-3 "
                        onSubmit={form.handleSubmit(onSubmit)}
                        >

                          {/* Title */}
                          <FormField
                          control={form.control}
                          name="title"
                          render = {({field}) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input className="" placeholder="Title for the question ..." {...field}/>
                              </FormControl>
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Controller
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                      <Tiptap {...field} setImageUpload={setImageUpload} uploadImage={uploadImage} progress={progress} />
                                    )}
                                   /> 
                                </FormControl>
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                          
                          {(progress||0)>0&&<span className='pt-3'>{`${Math.ceil((progress||0))} % Uploaded`}</span>}
                          {/* "0" to make upload percentage invisible when no image is selected */}
                          {/* anonymity toggle */}
                          <FormField
                            control={form.control}
                            name="anonymity"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Post Anonymously
                                  </FormLabel>
                                  {/* <FormDescription>
                                    Post question without revealing your identity.
                                  </FormDescription> */}
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <DialogClose asChild>
                              <Button type="submit" 
                                className=" w-full"
                                // disabled={isGuest === 'true'}
                              >
                                Post
                              </Button>
                          </DialogClose>
                            
                          

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

                    
                  </DialogContent>
              </Dialog>
              
            </div>
          </dl>
    </div>
  )
    }
}

export default AskQuestion

