"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";

import { X } from "lucide-react";

import { db, storage } from "@/utils/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

import { z } from "zod";
import { EventType } from "@/schemas/event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Input = z.infer<typeof EventType>;

type Props = {};

// type EventType = {
//   id: string;
//   title: string;
//   description: string;
//   eventImageURL: string;
//   dateOfEvent: string;
//   locationOfEvent: string;
//   durationOfEvent: number;
//   registrationLink: string;
//   uid: string;
//   createdAt: string;
//   name: string;
//   profilePic: string;
//   sponsors: string[];
// };

const AdditionalForm = (props: Props) => {
  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<Input>({
    // resolver: zodResolver(EventType),
    defaultValues: {
       sponsors: [],
       locationOfEvent: "",
       lateRegistrationFee: 0,
       earlyBirdRegistrationFee: 0,
       creditPoints: 0,
       contactNumber: 0,
       isVisible: true,

    },
  });

  const [sponsors, setSponsors] = useState<string[]>([]);
  const [sponsorInput, setSponsorInput] = useState<string>("");

  const [landmark, setLandmark] = useState<string>("");

  //const eventId = useSelector((state: RootState) => state.eventID.event_id);

  //fetching eventId from sessional storage
  const eventId = sessionStorage.getItem('devotionalEventId');
  console.log(eventId);

  async function updateEvent( eventId: string,data: Input )
  {
    const eventRef =  doc(db, "events", eventId);

    console.log(landmark);
    console.log(sponsors);

    // Append the landmark to the location of the event
    const locationOfEvent = data.locationOfEvent + ", " + landmark;
    console.log(locationOfEvent);

    try {
      // Get the current document
      const docSnap = await getDoc(eventRef);
  
      // Check if the sponsors field exists
      if (docSnap.exists() && docSnap.data().sponsors) {
        // If the sponsors field exists, update it
        console.log(docSnap.data().title)

        // Declare updateData as an object with string keys and values of any type
          const updateData: { [key: string]: any } = {
            sponsors: arrayUnion(...sponsors),
            locationOfEvent: docSnap.data().locationOfEvent + ", " + landmark,
            isVisible: data.isVisible,
            
          };

          // Only add the date fields if they are not undefined or null
          if (data.preConferenceDate !== undefined && data.preConferenceDate !== null) {
            updateData.preConferenceDate = data.preConferenceDate;
          }
          if (data.registrationStartDate !== undefined && data.registrationStartDate !== null) {
            updateData.registrationStartDate = data.registrationStartDate;
          }
          if (data.registrationEndDate !== undefined && data.registrationEndDate !== null) {
            updateData.registrationEndDate = data.registrationEndDate;
          }
          
          if (data.earlyBirdRegistrationFee !== undefined && data.earlyBirdRegistrationFee !== 0) {
            updateData.earlyBirdRegistrationFee = data.earlyBirdRegistrationFee;
          }
          if (data.lateRegistrationFee !== undefined && data.lateRegistrationFee !== 0) {
            updateData.lateRegistrationFee = data.lateRegistrationFee;
          }
          if (data.creditPoints !== undefined && data.creditPoints !== 0) {
            updateData.creditPoints = data.creditPoints;
          }
          if (data.contactNumber !== undefined && data.contactNumber !== 0) {
            updateData.contactNumber = data.contactNumber;
          }



        await updateDoc(eventRef, updateData);
      } else {
        // If the sponsors field doesn't exist, set it

        //just a waste of space and time , the code is not ever going to reach here

        // await updateDoc(eventRef, {
        //   sponsors: sponsors,
        //   locationOfEvent: docSnap?.data()?.locationOfEvent + ", " + landmark,
        // });
      }
  
      console.log("Update successful");
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully.",
      });

      router.push("/events");


    } catch (error) {
      console.error("Error updating document: ", error);
    }

  }

  function onSubmit(data: Input) {
    if (eventId === null) {
      toast({
        title: "Event ID is null",
        description: "Event ID is null. Please try again.",
      });
      console.log("Event ID is null");
      return;
    }

    // locationOfEvent: data.locationOfEvent + ", " + landmark;

    updateEvent(eventId, data);
    
  }

  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" flex-col space-y-8"
        >
          {/* Location of the Event */}
          <FormField
            control={form.control}
            name="locationOfEvent"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Landmark</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Any Landmark near location of the Event."
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </FormControl>
                  <div className="text-[12px] opacity-70">Optional*</div>
                  <FormMessage />
                </FormItem>
            )}
          />

          {/* //spnosors section */}
          <FormField
            control={form.control}
            name="sponsors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sponsors</FormLabel>
                <FormControl>
                  <div className=" flex gap-2">
                    <Input
                      placeholder="Sponsors"
                      value={sponsorInput}
                      onChange={(e) => setSponsorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setSponsors((prev) => [...prev, sponsorInput]);
                          setSponsorInput("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setSponsors((prev) => [...prev, sponsorInput]);
                        setSponsorInput("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </FormControl>

                <div className=" flex gap-2">
                  {sponsors.map((sponsor, index) => (
                    <div
                      key={index}
                      className=" flex gap-1 p-2 rounded-3xl bg-[#F6F6F7]"
                    >
                      <p>{sponsor}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newSponsors = [...sponsors];
                          newSponsors.splice(index, 1);
                          setSponsors(newSponsors);
                        }}
                      >
                        <X />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-[12px] opacity-70">
                  Add sponsors for the event.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CME Date */}
          <FormField
            control={form.control}
            name="preConferenceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pre-Conference CME Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("1900-01-01")
                      // }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>
                  This is the date of the event.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          
          {/* Registration Dates */}
          <div className=" flex-col space-y-3 ">
            <p className=" font-normal text-base">Registration Dates</p>
          <FormField
            control={form.control}
            name="registrationStartDate"
            render={({ field }) => (
              <FormItem className="">
                {/* <FormLabel className=" ">Registration Dates : </FormLabel> */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("1900-01-01")
                      // }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationEndDate"
            render={({ field }) => (
              <FormItem className="flex gap-4">
                {/* <FormLabel className=" mt-5">Registration Dates : </FormLabel> */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>End date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("1900-01-01")
                      // }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <FormMessage />
              </FormItem>
            )}
          />

          </div>


          {/* Early Bird Registration Fees */}
          <FormField
            control={form.control}
            name="earlyBirdRegistrationFee"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Early Bird Registration Fee</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Registration Fees"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-[12px] opacity-70">Optional*</div>
                  <FormMessage />
                </FormItem>
            )}
          />


          {/* Late Registration Fees */}
          <FormField
            control={form.control}
            name="lateRegistrationFee"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Late registration Fee</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Registration Fees"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
          />

          {/* Credit Points */}
          <FormField
            control={form.control}
            name="creditPoints"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Points</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter points"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
          />


          {/* Contact */}
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 10 digit phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
          />

          {/* Always true Switch */}
          <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible</FormLabel>
                    
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />

          

          <Button className=" w-full my-4" type="submit">
            Update
          </Button>

        </form>
      </Form>
    </div>
  );
};

export default AdditionalForm;
