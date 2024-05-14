

import Image from 'next/image'
import React from 'react'

import { Avatar, AvatarFallback , AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Button} from '@/components/ui/button'

import { CalendarCheck2, HistoryIcon } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { History } from 'lucide-react';
import { FileBadge } from 'lucide-react';


type Props = {}

const ConferencePage = (props: Props) => {
  return (
    <div className=' grid md:grid-cols-2 lg:grid-cols-7 gap-y-4 md:gap-x-4 pb-6 font-dmsans'>
        <div className=' md:col-span-5 col-span-2 order-first  '>

          <div className=' w-full  bg-white dark:bg-[#262626] rounded-md shadow break-words overflow-hidden mt-1 font-dmsans'>

            <div className=''>
                <div>
                    <Image src='https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F723807029%2F1879204942643%2F1%2Foriginal.20240320-051010?w=940&auto=format%2Ccompress&q=75&sharp=10&s=5758072329789ed48407ed8022bcbe72' width={1920} height={1080} alt='Conference' />
                </div>
                <div className=' max-w-[70%]'>
                    <div className='p-4 space-y-7'>
                        <h1 className='text-3xl font-bold'>You are invited: Orientation day with a Leading Pilot Training Academy. </h1>
                    </div>
                </div>
            </div>

            <div className=' max-w-[70%] p-4 gap-3'>
                <div className=' '>
                    <div className=' flex gap-3 '>
                        <Image
                        src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAALVBMVEVHcEwOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5kOg5l//w8OAAAADnRSTlMAv9QQ52QelaZB9jVSd7YgM2MAAAEESURBVCiRfVJbEsQgCBPE+ub+x11QcV07s/lpMRog4JzBhwiIEIN3NyrwBtRfLvEP4KB84QvlMe65KYWxueXWmiQNrQUTKZNrLiWtkDm58Tny1rKOcWp1Y7MEwEJG+RFB1Nu0SAm83I9RZBsActMS7Kl3gceJqMWhMrQmgovMvU75R2T60VrSa6mMwgmt8WhJpUYi1ZcEzdhJkpIK7bdvP8MiNXuofpQ0RgC7HRz6YWkRiScjqrMgVVALcpnx0U5XE5gSmN/ajt71czDHCkzPupYu6dDkv4i9z4EM46+neyBrkV5LwlRz/rcmewOf99u9YO+852qqB3i0k90NHxISYepfxQ9lzhbYL6o6zQAAAABJRU5ErkJggg=='
                        width={10}
                        height={10}
                        alt='Conference'
                        className=' w-9 h-9 mt-2'
                        />
                        <div className=' space-y-1'>
                            <div className=' text-gray-700 flex gap-2 py-4'>
                                <p>By <span className='text-black font-bold'>BAA Training</span></p>
                            </div>
                            
                        </div>
                    </div>

                    
                    

                </div>
            </div>

            <div className=' p-4 space-y-3 mt-4'>
                <h1 className=' font-bold'>Date and Time</h1>
                <div className=' flex gap-3'>
                    <CalendarCheck2 size={24} />
                    <p className=' font-semibold text-gray-900 text-sm'>Saturday, April 14th 9am-6pm IST</p>
                </div>
            </div>

            <h1 className=' font-bold px-4 my-3 mt-7'>Location</h1>
            <div className=' px-4 flex gap-x-5'>
                <div className=' mt-2'>
                    <MapPin size={24} />
                </div>
                <div className=' flex-col gap-y-3'>
                    <p className=' font-bold text-base'>Radisson Bengaluru City Center</p>
                    <p className=' text-sm'>2 Gangadhar Chetty Road Bengaluru, KA 560042</p>
                    <div className=' flex gap-1'>
                        <p className=' text-base font-bold text-blue-400 hover:underline cursor-pointer'>Show Map</p>
                        <ChevronDown className='text-blue-400' size={24} />
                    </div>
                </div>
            </div>


            <div className=' p-4 mt-7'>
                <h1 className=' font-bold '>About this event</h1>
                <div className=' flex gap-2 mt-2'>
                        <History size={24} className=' mt-2' />
                        <p className=' text-sm text-gray-700 mt-2'>9 Hours</p>
                </div>
                <div className=' flex gap-2 my-2'>
                  <FileBadge size={24} className=' mt-2'/>
                  <p className=' text-sm text-gray-700 mt-2'>100 CME Credits</p>
                </div>
            </div>

            <div className=' text-base text-gray-700 p-4 mt-3 max-w-[80%]'>
                <div>
                    <p>
                    Are you aiming for a career as a commercial pilot? Besides being a childhood dream for many, a pilot profession offers a combination of salary, job security, and the opportunity to travel!
                    </p>
                    <p className=' mt-2'>
                    Meet the BAA Training team in Bengaluru <span className=' font-bold text-gray-800'> on 13th April 2024</span> and clarify all the grey areas regarding pilot training and career prospects!
                    </p>
                    <div className=' font-bold text-gray-700 flex-col space-y-4 mt-2'>
                        <p>
                            Date: 13th April 2024
                        </p>
                        <p>Time: 9am to 6pm</p>
                        <p>Address: 2, Gangadhar Chetty Rd, Halasuru , Yellappa Chetty Layout, SivanChetti Gardens, Bengaluru , Karnatka, 560042, India</p>
                    </div>
                </div>
                    
            </div>

            <div className='text-base p-4 mt-4 max-w-[80%]'>
                <h1 className=' font-bold my-2'>Who is it for?</h1>
                <p>Anyone seeking a life full of joy, meaning, and self-fulfillment can fly as an A320 or 8737 pilot at one of the leading airlines in India or elsewhere! No previous aviation experience is required to get started!</p>
            </div>

            <div className='text-base p-4 mt-4 max-w-[80%]'>
                <h1 className=' font-bold my-2'>Here is the plan</h1>
                <div className=' flex gap-2 ml-2'>
                <svg
                  viewBox="0 0 48 48"
                  className=" mt-[1.20rem] mr-1 w-4 h-4"
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
                <p>You all hear about an Indian pilot cadet program that will take you from zero to an airline-ready First Officer in record time!</p>                

                </div>

                <div className=' flex gap-2 ml-2'>
                <svg
                  viewBox="0 0 48 48"
                  className=" mt-[1.20rem] mr-1 w-4 h-4"
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
                <p>You all find out why accepting a \one-stop shop\ offer (ATPL Integrated+TR+ base training) will save you time and money.</p>
                </div>

                <div className=' flex gap-2 ml-2'>
                <svg
                  viewBox="0 0 48 48"
                  className=" mt-[1.20rem] mr-1 w-3 h-3"
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
                <p>You all understand why a dual EASA-DGCA license guarantees excellent career opportunities.</p>
                </div>

                <div className=' flex gap-2 ml-2'>
                <svg
                  viewBox="0 0 48 48"
                  className=" mt-[1.20rem] mr-1 w-5 h-5"
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
                <p>You all learn more about BAA Training, Europes leading ATO, its international locations, expert instructors, top-notch training methods, and more!</p>
                </div>
                
            </div>

            <div className='p-4 mt-4'>
              <div className=' flex gap-4'>
                <h1 className=' text-xl font-bold'>Registration Link :</h1>
                <p className=' text-blue-400 underline cursor-pointer mt-1'>https://devotional-b.vercel.app/conference</p>
              </div>
            </div>

            <div className=' p-4 my-7 max-w-[80%]'>
                <h1 className=' font-bold text-2xl mb-4 '>Tags</h1>

                <div>
                    <div className=' space-y-2'>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl'>
                            Pilot Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Aviation
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Career
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            BAA Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl'>
                            Pilot Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Aviation
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Career
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            BAA Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl'>
                            Pilot Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Aviation
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Career
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            Training
                        </Button>
                        <Button className=' bg-[#F1F2F2] text-black rounded-3xl ml-2'>
                            BAA Training
                        </Button>
                    </div>
                </div>

            </div>

            </div>

            <div className=' mt-3 p-4'>
              <div
                className="rounded-3xl border border-gray-300 p-4 cursor-pointer mx-2 md:mx-0 my-6"
                // onClick={() => setIsCommentBoxOpen(false)}
              >
                Write a Answer...
              </div>
            </div>


        </div>

        <div className=' sm:block hidden col-span-2 sticky overflow-hidden h-fit rounded-lg border border-gray-300 order-last'>
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Sponsors</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.nguyen@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}

export default ConferencePage