"use client";

import React, { useState } from "react";

import { TrendingUp } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { BadgePlus } from "lucide-react";
import Link from "next/link";

type Props = {};

const TopFeedCard = (props: Props) => {
  const [activeLink, setActiveLink] = useState("trending");

  return (
    <div className=" col-span-5">
      <div className=" bg-[#F9FAFB] dark:bg-[#161617] w-full p-4 rounded-md flex gap-6 shadow-md border  border-gray-400/40">
        <Link
          href={"/"}
          className={`gap-2 flex ${
            activeLink === "trending" ? "  p-1  rounded-3xl bg-gray-200 dark:bg-[#353538] " : "p-1"
          }`}
          onClick={() => setActiveLink("trending")}
        >
          <TrendingUp />
          <p className=" font-semibold text-sm">Trending</p>
        </Link>

        <Link
          href={"/"}
          className={`flex gap-2 ${activeLink === "top" ? "p-1  rounded-3xl bg-gray-200 dark:bg-[#353538]" : "p-1"}`}
          onClick={() => setActiveLink("top")}
        >
          <BarChart3 />
          <p className=" font-semibold text-sm">Top</p>
        </Link>

        <Link
          href={"/"}
          className={`flex gap-2 ${activeLink === "new" ? "p-1  rounded-3xl bg-gray-200 dark:bg-[#353538]" : "p-1"}`}
          onClick={() => setActiveLink("new")}
        >
            <BadgePlus />
            <p className=" font-semibold text-sm">New</p>
        </Link>
        {/* <Link href={"/"} className=' '></Link> */}

        {/* 3 dots */}
        <div className=" flex p-1">
          <svg
            viewBox="0 0 48 48"
            className=" mt-1 w-3 h-3"
            fill="currentColor"
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
                fill=""
              ></path>{" "}
            </g>
          </svg>
          <svg
            viewBox="0 0 48 48"
            className=" mt-1 w-3 h-3"
            fill="currentColor"
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
                fill=""
              ></path>{" "}
            </g>
          </svg>
          <svg
            viewBox="0 0 48 48"
            className=" mt-1 w-3 h-3"
            fill="currentColor"
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
                fill=""
              ></path>{" "}
            </g>
          </svg>
        </div>



      </div>
    </div>
  );
};

export default TopFeedCard;
