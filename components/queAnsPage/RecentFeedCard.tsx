import Image from "next/image";
import React from "react";
import { Separator } from "../ui/separator";
import Link from "next/link";

type Props = {
  post: {
  id: string;
  name: string;
  title: string;
  profilePic: string;
  voteAmt: number;
  comments: number;
  createdAt: string;
  anonymity: boolean;
  };
};

const RecentFeedCard = ({ post }: Props) => {

  const isAnonymous = post.anonymity
  return (
    <div className="font-dmsans">
  <div className="flex gap-2 flex-col">
  <div className='flex max-h-40 mt-1 space-x-3 text-gray-500'>
            <div className="">
                    <div className=' relative w-full rounded-full overflow-hidden'>
                        <Image
                        width={30}
                        height={30}
                        objectFit="cover"
                        src={isAnonymous ? ('https://qph.cf2.quoracdn.net/main-qimg-73e139be8bfc1267eeed8ed6a2802109-lq') : (post.profilePic)}
                        alt='profile picture'
                        referrerPolicy='no-referrer'
                        />
                    </div>
            </div>
            <Separator orientation='vertical' className=' h-5 mt-1 '/>
        <span className=''>{isAnonymous ? 'Anonymous' : post.name}</span>
          </div>
    <div className="flex flex-col">
    <Link href={`/${post.title.split(' ').join('-')}`}>
      <h3 className="font-medium text-lg mb-1">{post.title.length>27?`${post.title.substring(0,27)}...`:post.title}</h3>
    </Link>
      <div className="text-sm flex gap-1">
        <p className="text-zinc-500">{post.voteAmt?post.voteAmt:0} supports</p>
        <svg viewBox="0 0 48 48" className="mt-1 w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 36C30.6274 36 36 30.6274 36 24C36 17.3725 30.6274 12 24 12C17.3726 12 12 17.3725 12 24C12 30.6274 17.3726 36 24 36Z" fill="#333333"></path>
        </svg>
        <p className="text-zinc-500">{post.comments} answers</p>
      </div>
    </div>
  </div>
</div>
  );
};

export default RecentFeedCard;