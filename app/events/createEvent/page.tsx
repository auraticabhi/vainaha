import React from "react";
import { Separator } from "@/components/ui/separator";
import CreatEventPage from "./createEvent-form";

type Props = {};

const EventCreationPage = (props: Props) => {
  return (
    <div className="space-y-6 font-dmsans ">
      <div>
        <h3 className="text-lg font-medium">Create Event</h3>
        <p className="text-sm text-muted-foreground">
          Fill the form to create your event.
        </p>
      </div>
      <Separator />
      <CreatEventPage />
    </div>
  );
};

export default EventCreationPage;
