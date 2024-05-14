
"use client";

import React, { useEffect , useState } from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth , db } from "@/utils/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';

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

type Props = {}

const NotificationPage = (props: Props) => {

    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    //for real-time notifications
  const [notifications , setNotifications] = useState<any[]>([]);

  //fetching real-time notifications
useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, "notifications");
      const q1 = query(
        notificationsRef, 
        where("questionUid", "==", user.uid),
        where("answerUid", "<", user.uid),
        orderBy("createdAt", "desc")
      );
      const q2 = query(                    //had to do it like this in order to show the notification only when other users answer the question and not when the user answers his own question himself
        notificationsRef, 
        where("questionUid", "==", user.uid),
        where("answerUid", ">", user.uid),
        orderBy("createdAt", "desc")
      );
  
      const unsubscribe1 = onSnapshot(q1, snapshot => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(newNotifications);
      });
  
      const unsubscribe2 = onSnapshot(q2, snapshot => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(newNotifications);
      });
  
      // Clean up the listeners when the component unmounts
      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    }
  }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }
    , [user, loading , router]);

    

  return (
    <div>
        <div className="w-full p-4 font-dmsans">
            {/* <h1 className="text-2xl font-bold text-black dark:text-white">Notifications</h1> */}
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="text-left text-2xl font-bold text-black dark:text-white">Recent Notifications</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {notifications.map((notification, index) => (
                <TableRow key={index}>
                    <TableCell className="text-[#195FAA] text-base">
                    <Link href={`/${encodeURIComponent(notification.questionTitle.split(" ").join("-"))}`} className=" flex gap-2">
                      <Image
                      src={notification.answerProfilePic || "/nodp.webp"}
                      alt="profile picture"
                      width={24}
                      height={24}
                      className=" h-8 w-8 rounded-full my-auto"
                      />
                      <span>
                        <span className="font-bold">{notification.answerName} </span> 
                         answered your question <span className=" font-bold underline">{notification.questionTitle}</span>
                      </span>
                    </Link>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
  )
}

export default NotificationPage