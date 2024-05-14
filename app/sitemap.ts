

import { MetadataRoute } from "next";

import { collection , query , getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

type Post = {
    title: string;
}

//Fetch all posts from firestore
export async function getPosts(){
    const postsRef = collection(db, "questions");
    const q = query(postsRef);

    const posts = <any>[];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        posts.push(doc.data() as Post);
    });

    return posts;
}


export default async function sitemap(){

    const baseUrl = "https://devotional-b.vercel.app";

    const posts = await getPosts();
    
    const postsUrls = posts?.map((post:any) => {
        return{
            url: `${baseUrl}/${post.title.split(" ").join("-")}`,
            lastModified: new Date().toISOString(),
        }
    }) ?? [];

    return[
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
        },
        ...postsUrls
        
    ]
    
}