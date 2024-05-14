import { RecentPosts } from '@/lib/data'
import React, { useEffect, useState } from 'react'

import RecentFeedCard from './RecentFeedCard'
import { collection, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { Separator } from '../ui/separator'
import parse from "html-react-parser"

type Props = {}

type PostType = {
  id: string;
  name: string;
  title: string;
  profilePic: string;
  description: string;
  voteAmt: number;
  comments: number;
  createdAt: string;
  anonymity: boolean;
  // Add any other fields as necessary
}

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link'

const RecentFeed = (props: Props) => {

  const [posts , setPosts] = useState<PostType[]>([]);

  useEffect(() => {

    const collectionRef = collection(db, 'questions');
    const q = query(collectionRef, orderBy('createdAt', 'desc'), limit(5));

    const unsub = onSnapshot(q, async(snapshot) => {
      const postsData =[];

      for (const doc of snapshot.docs) {
        
        // Fetch the 'answers' subcollection for each question
        const answersCollectionRef = collection(doc.ref, 'answers');
        const answersQuery = query(answersCollectionRef);
    
        const answersSnapshot = await getDocs(answersQuery);
        const numAnswers = answersSnapshot.size;
    
        // Add the total number of answers to the question data
        const questionData = { id: doc.id, comments: numAnswers, ...doc.data() } as PostType;
    
        postsData.push(questionData);
      }
  
      //console.log(postsData)
      setPosts(postsData);
    })

    return () => {
      unsub()
    }
  }, [])
  
  return (
    <div className='max-h-[40rem] p-2 overflow-auto bg-[#FFFFFF] dark:bg-[#262626] shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)]'>

<Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-dmsans text-left font-bold text-lg text-black dark:text-white">Recent Posts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post, index) => (
          <TableRow key={index}>
            <Link className='flex flex-col' href={`/${encodeURIComponent(post?.title?.split(" ").join("-"))}`}>
            <TableCell className="text-black text-base font-semibold font-dmsans">{post.title.length>70?post.title.substring(0, 69)+"...":post.title}</TableCell>
            <TableCell className="text-sm text-gray-800 font-dmsans">{post.description.length>1000?parse(post.description.substring(0, 99))+"...":parse(post.description)}</TableCell>
            </Link>
            <Separator/>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell>Ask Question...</TableCell>
        </TableRow>
      </TableFooter> */}
      </Table>


    </div>
  )
}

export default RecentFeed