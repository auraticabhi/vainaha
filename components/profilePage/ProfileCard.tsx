import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

type Props = {
  // user: {
  //   photoURL?: string;
  //   displayName?: string;
  //   uid?: string; // Assuming user object contains the UID
  // } | null;
  user: any
};

const ProfileCard = ({user}: Props) => {

  //console.log("User: ", user.uid);

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [name, setName] = useState<string>(user?.displayName);
  const [bio, setBio] = useState("");

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
          const bioo = userData?.bio;
          // Assuming followers and following fields exist in user data
          setName(realName);
          setBio(bioo);
          setFollowersCount(followers || 0);
          setFollowingCount(following || 0);
        }
      }
    };

    fetchFollowersAndFollowing();
  }, [user?.uid]);


  const otherUser:boolean=false;
  return (
    <div>
      <div className="flex mx-auto bg-[#FFFFFF] dark:bg-[#262626] p-5 rounded-lg font-dmsans">

        <div className="ml-5">
        <Image
          src={user?.photoURL || '/nodp.webp'}
          width={300}
          height={300}
          className=" lg:w-[7rem] lg:h-[7rem] w-[5rem] h-[5rem] rounded-full"
          alt="Profile Pic"
        />
        {/* <p className=" mt-4 text-sm">Write a description about yourself ...</p> */}
        </div>


        <div className="mx-5">
          <h1 className="lg:text-4xl text-xl font-bold">{name}</h1>
          <div className={`${bio?"":"h-3"}`}></div>
          <div className="text-sm lg:text-base text-opacity-90">{bio}</div>
          <div className=" flex gap-x-2 mt-1 lg:text-base text-xs opacity-80">
          <p>{followersCount} Followers</p>
            <svg
              viewBox="0 0 48 48"
              className="lg:mt-2 lg:w-3 lg:h-3 w-1"
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

            <p>{followingCount} Following</p>
          </div>

          {otherUser&&
          <Button variant='outline' className=" mt-4 rounded-3xl">Follow</Button>
          }

        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
