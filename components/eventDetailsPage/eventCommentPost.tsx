import React from 'react'

import { Avatar, AvatarFallback } from '../ui/avatar'

import Image from 'next/image'

import  parse  from 'html-react-parser'

type Props = {
    eventComment: {
        comment: string,
        createdAt: string,
        profilePic: string,
        name: string,
        imageUrl: string,
        eventTitle: string,
        eventId: string,
        uid: string,
    }
}

const EventCommentPost = ({eventComment}: Props) => {


  return (
    <div>
        <div
          key={eventComment.eventId}
          className="rounded-md bg-white dark:bg-[#262626] shadow my-3 space-y-0 break-words overflow-hidden" 
        >
          <div className="px-6 py-5">
            {/* <PostVoteClient
            //   postId={post.id}
            //   initialVotesAmt={_votesAmt}
            //   initialVote={_currentVote?.type}
            /> */}

            <div className="">
              <div className="flex w-full max-h-40 mt-1 space-x-2 text-xs text-gray-500">
                {/* <div> */}
                <Avatar>
                  <div className=" relative w-full h-full aspect-square">
                    <Image
                      fill
                      src={eventComment.profilePic}
                      alt="profile picture"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                {/* </div> */}
                <span className="mt-3  text-sm font-semibold text-[#0c0c0c] dark:text-white">{eventComment.name}</span>
                </div>
                {/* {formatTimeToNow(new Date(post.createdAt))} */}
              </div>
              {/* <a href={`/postPage/${eventComment.id}`}>
                <h1 className="text-3xl font-semibold py-2 leading-6 text-gray-900 dark:text-white">
                  {eventComment.title}
                </h1>
              </a> */}

              {eventComment.imageUrl ? (
                  <div className="relative w-full h-[400px] mt-2">
                    <Image
                      src={eventComment.imageUrl}
                      className="rounded-md"
                      layout="fill"
                      alt="eventComment image"
                      objectFit="contain"
                    />
                  </div>
                ) : null
              }

              <div
                className="relative text-base max-h-50 text-[#282829] dark:text-white w-full mt-2 "
              >
                {/* <EditorOutput content={post.content} /> */}
            <p className="ProseMirror">{eventComment.comment ? parse(eventComment.comment) : ""}</p>

                {/* <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white/80 dark:from-[#262626] to-transparent'></div> */}
                {/* {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              
            ) : null} */}
              </div>
            </div>
          </div>

        </div>

  )
}

export default EventCommentPost