"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { auth, db } from "@/utils/firebase";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInAnonymously,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import logo from "../../public/logo.png"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {};

const LoginPage = (props: Props) => {
  const router = useRouter();

  const [user, loading] = useAuthState(auth);

  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const [anonymousUserName, setAnonymousUserName] = useState("");

  //gogle sign in
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        // console.log(user);
        router.push("/events");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //facebook sign in
  const signInWithFacebook = async () => {
    await signInWithPopup(auth, facebookProvider)
      .then((result) => {
        const user = result.user;
        // console.log(user);
        router.push("/events");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //email signup and signin
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const signUpWithEmail = async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // console.log(user);

        // Send email verification
        await sendEmailVerification(user)
          .then(() => {
            console.log("Verification email sent.");
          })
          .catch((error) => {
            console.log(error);
          });

        //setting 'name' to email and 'profilePic' to url
        //  const docRef = doc(collection(db , "questions"));
        //  await setDoc(docRef , {
        //   name: user.email,
        //   profilePic: "https://avatars.githubusercontent.com/u/107865087?v=4"
        //  })

        //above solution not worth it , will remove the code soon

        // Update user's profile
        await updateProfile(user, {
          displayName: email, // Set displayName to email
          photoURL: "https://avatars.githubusercontent.com/u/107865087?v=4", // Set photoURL to a default image URL
        });

        router.push("/events");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signInWithEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);

        router.push("/events");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //signin anonymously
  const signingInAnonymously = async (
    e: React.SyntheticEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    // guests should not be able to post questions
    // const isGuest = true;

    // Generate a unique 4-digit number
    const uniqueNumber = Math.floor(1000 + Math.random() * 9000);

    await signInAnonymously(auth)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // console.log(user);
        // Update user's profile
        await updateProfile(user, {
          // displayName: anonymousUserName, // Set displayName to anonymousUser
          displayName: `Guest${uniqueNumber}`, // Set displayName to "Guest1234"
          photoURL:
            "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png", // Set photoURL to a default image URL
        });
        router.push("/?isGuest=true");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (user) {
      const createUserDocument = async () => {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
  
        if (!docSnap.exists()) {
          // User document doesn't exist, create it with basic data
          await setDoc(userRef, {
            name: user.displayName || "", // Use user's display name or empty string
            email: user.email || "", // Use user's email or empty string
            profilePic: user.photoURL || "", // Use user's photo URL or empty string
            //savedPosts: [], Initialize savedPost array
          });
        } else {
          // User document exists, check if name, email, and profilePic fields are missing
          const userData = docSnap.data();
          if (!userData.name || !userData.email || !userData.profilePic) {
            // Update user document with missing fields
            await updateDoc(userRef, {
              name: userData.name || user.displayName || "", // Use existing or new display name
              email: userData.email || user.email || "", // Use existing or new email
              profilePic: userData.profilePic || user.photoURL || "", // Use existing or new photo URL
            });
          }
        }
      };
  
      router.push("/events");
      createUserDocument();
    }
  }, [user, loading, router]);
  

  return (
    <>
      <div className=" absolute bg-login-bg bg-cover bg-no-repeat left-0 top-0 h-full w-full font-dmsans"></div>
      <div className="bg-[#F8FAFC] md:absolute md:-translate-x-1/2 md:-translate-y-1/2 md:top-1/2 md:left-1/2 items-center justify-center flex shadow-xl rounded-md max-w-[750px] min-h-[450px] font-dmsans">
        <div className="relative    w-full h-full  ">
          <div className="relative bg-[#F8FAFC] rounded-lg ">
            <div className="px-4 py-9 md:py-0">
              <div className="text-center">
                <p className="mb-4 text-2xl font-semibold leading-5 text-slate-900 flex justify-center">
                <Image src={logo} alt="logo" width={160} height={60} />
                </p>
                <p className="mt-2 text-sm leading-4 text-slate-600">
                  Your Personal Devotional Forum. Sign Up/Sign In to Continue.
                </p>
              </div>

              <div className=" md:flex md:flex-col-2 w-full mt-11">
                <div className="mt-1 flex flex-col gap-4 w-full px-4">
                  <p className=" text-sm text-zinc-400">
                    By continiuing you indicate that you agree to Devotional-B{" "}
                    <span className=" text-blue-500">Terms of Service</span> and{" "}
                    <span className=" text-blue-500">Privacy Policy</span>.
                  </p>
                  <button
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border hover:bg-gray-100 border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={signInWithGoogle}
                  >
                    <Image
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] "
                    />
                    Continue with Google
                  </button>

                  <button
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border hover:bg-gray-100 border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={signInWithFacebook}
                  >
                    <Image
                      src="https://www.svgrepo.com/show/489934/facebook.svg"
                      alt="Google"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] "
                    />
                    Continue with Facebook
                  </button>

                      <button
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border hover:bg-gray-100 border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={signingInAnonymously}
                      >
                        <Image
                      src="https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
                      alt="Google"
                      width={18}
                      height={18}
                      className="h-[19px] w-[19px] "
                    />
                        Continue as Guest
                      </button>
                </div>

                <div className="md:hidden flex w-full items-center gap-2 py-6 text-sm text-slate-600">
                  <div className="h-px w-full bg-slate-200"></div>
                  OR
                  <div className="h-px w-full bg-slate-200"></div>
                </div>

                <Separator
                  orientation="vertical"
                  className="h-[15rem] sm:block hidden"
                />

                <div className=" w-full space-y-3">
                  <p className=" ml-4 text-zinc-400">Login</p>
                  <Separator
                    orientation="horizontal"
                    className="h-px ml-4 my-1 w-[90%] bg-slate-200"
                  />
                  <div className="w-full px-3 py-1 ">
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
                      placeholder="Email Address"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="mb-5 mt-2 text-sm text-gray-500">
                      {/* Reset your password? */}
                    </p>

                    <div className=" flex gap-2">
                      <button
                        // type="submit"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
                        onClick={signUpWithEmail}
                      >
                        Sign Up
                      </button>

                      <button
                        // type="submit"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
                        onClick={signInWithEmail}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" text-center text-sm text-slate-600">
                {/* Dont want to have an account? */}
                {/* <button className="font-medium text-[#4285f4] ml-1 underline"
              onClick={signingInAnonymously}
              >
                 Continue as Guest
              </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default LoginPage;
