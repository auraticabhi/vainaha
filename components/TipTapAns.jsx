
'use client'

import React, { useCallback , useEffect, useRef } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Progress } from "./ui/progress";
import { Toggle } from "./ui/toggle";

import {
  FaBold,
  FaHeading,
  FaItalic,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
} from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import { FaImages } from "react-icons/fa6";

const MenuBar = ({ editor , setImageUpload , uploadImage , progress}) => {

    //image insert krne k liye 

    const hiddenFileInput = useRef(null);

    const handleFileSelect = (event) => {
        if(event.target.files)
        {
            setImageUpload(event.target.files[0]);
            uploadImage(event.target.files[0]);
        }
    }

    const handleClick = () => {
        hiddenFileInput.current.click();
    };



  //inserting links
  const setLink = useCallback(() => {

    //links insert krne k liye
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run()
  }, [editor])


  //inserting images through URL
  const addImage = () => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  //for updating the progress bar
  useEffect(() => {
    console.log("Progress", progress);
    }, [progress]);


  if (!editor) {
    return null;
  }

  return (
    <div className=" flex items-left ml-1  gap-x-4">
      <div className=" flex gap-0 ">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is_active" : ""}
          >
            <Toggle variant="" aria-label='Toggle Bold'>
                <FaBold />
            </Toggle>

          </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is_active" : ""}
        >
        <Toggle aria-label='Toggle Italics'>
          <FaItalic />
        </Toggle>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is_active" : ""}
        >
        <Toggle aria-label='Toggle Italics'>
          <FaUnderline />
        </Toggle>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is_active" : ""}
        >
        <Toggle aria-label='Toggle Strike'>
          <FaStrikethrough />
        </Toggle>
        </button>

        <button 
          type="button"
          onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
          <Toggle aria-label='Toggle Link'>
          <IoIosLink />  
          </Toggle>
      </button>

        {/* <button 
          type="button"
          onClick={addImage}>                  //for images through URL
          <FaImages />
        </button> */}

        <button type="button" onClick={handleClick}>
          <Toggle aria-label='Toggle Image'>
            <FaImages />
          </Toggle>
        </button>
        {/* <p>{progress}</p> */}
        <Progress value={progress} className=" w-full z-10"/>
        <input type="file" ref={hiddenFileInput} onChange={handleFileSelect} style={{display: 'none'}} />



      </div>
      
    </div>
  );
};

// const extensions = [
//   Color.configure({ types: [TextStyle.name, ListItem.name] }),
//   TextStyle.configure({ types: [ListItem.name] }),
//   StarterKit.configure({
//     bulletList: {
//       keepMarks: true,
//       keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
//     },
//     orderedList: {
//       keepMarks: true,
//       keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
//     },
//   })
// ];

export const Tiptap = ({ onChange ,value  , setImageUpload , uploadImage , progress}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline ,
      // Placeholder.configure({
      //   placeholder: "Write ...",
      //   placeholderClassName: "text-gray-400",
      //   emptyNodeText: "Write ...",
      //   editorProps: {
      //     attributes: {
      //       class: "prose rounded-lg border border-input text-black  ring-offset-2 disabled:opacity-50  min-h-[10rem] p-4 py-[8rem]",
      //     },
      //   },
      //   content: `write ...`,
        
      // }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        editorProps: {
          attributes: {
            class: "underline text-blue-500",
          },
        },
      }),
      Image,
    ],
    content: ``,
    placeholder: `Write ...`,
    editorProps: {
      attributes: {
        class: "disabled:opacity-50  min-h-[10rem] p-4 py-[8rem] focus:outline-none",
      },
    },
    

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // setDescription(html);
      onChange(html);
      // console.log("HTML", html);
    },
  });

  return (
    <div className="">
      <MenuBar editor={editor} setImageUpload={setImageUpload} uploadImage={uploadImage} progress={progress} />
      <EditorContent editor={editor} className=" min-h-[10rem]"  />
      {
        progress != 0 &&
        
          <Progress value={progress} className=" w-full"/>
        
      }


    </div>
  );
};
