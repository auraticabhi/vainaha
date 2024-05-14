"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from '../../components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { useToast } from "@/components/ui/use-toast";
import { doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/utils/firebase"
import { useAuthState } from "react-firebase-hooks/auth"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
    email: z
    .string()
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  username: "example",  
  email: "abc@example.com",  
  bio: "I am a user of TheGodSays",
  urls: [
    { value: "https://devotional-b.vercel.app/" },
    { value: "https://devotional-b.vercel.app/auth" },
  ],
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const { toast } = useToast();

  const [user, loading] = useAuthState(auth);

  async function onSubmit(data: ProfileFormValues) {
    if (user) {
      const uid = user.uid;
      const userDocRef = doc(db, 'users', uid);
  
      try {
        const userData: {
            username: string | undefined;
            newEmail: string | undefined;
            bio: string | undefined;
            urls?: { value: string }[]; // Define the URL array type
          } = {
            username: data.username||"",
            newEmail: data.email||"",
            bio: data.bio||"",
            urls: data.urls
          };
  
        // Check if each field in userData exists in data before updating
        if (data.username) userData.username = data.username;
        if (data.email) userData.newEmail = data.email;
        if (data.urls) userData.urls = data.urls;
        if (data.bio) userData.bio = data.bio;
  
        await updateDoc(userDocRef, userData);
  
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error Updating Profile',
          description: 'An error occurred while updating your profile.',
        });
        console.error('Error updating profile:', error);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="thegodsays" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this once every 30 days.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="abc@gmail.com" {...field} />
              </FormControl>
              <FormDescription>
                You can manage verified email addresses in your{" "}
                <Link href="/examples/forms">email settings</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            Add URL
          </Button>
        </div>
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}