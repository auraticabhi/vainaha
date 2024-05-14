
'use client'

import React, { useCallback } from "react";

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

const MenuBar = ({ editor }) => {

  //inserting links
  const setLink = useCallback(() => {
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


  if (!editor) {
    return null;
  }

  return (
    <div className="pb-5 flex items-left px-4 border rounded-lg py-3 mt-4 gap-x-4">
      <div className=" flex gap-4">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is_active" : ""}
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is_active" : ""}
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is_active" : ""}
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is_active" : ""}
        >
          <FaStrikethrough />
        </button>

        <button 
          type="button"
          onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
          <IoIosLink />  
      </button>

        <button 
          type="button"
          onClick={addImage}>
          <FaImages />
        </button>

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

export const Tiptap = ({ onChange ,value }) => {
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
        class: "prose rounded-lg border border-input   ring-offset-2 disabled:opacity-50  min-h-[10rem] p-4 py-[8rem]",
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
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className=" min-h-[15rem] rounded-lg"  />
    </div>
  );
};
