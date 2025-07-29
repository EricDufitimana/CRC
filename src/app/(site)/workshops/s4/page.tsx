


import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import Layout from "@/components/workshops/layout"

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};
const workshops = [
   {
    date: "September 25th",
    title: "Note Taking Habits",
    description: "Students were taught four different note taking methods and discussed their usage, advantages, and disadvantages.",
    assignment: {
      task: "Using one of the methods discussed, take notes on a 4 minute video titled 'Exploring Afrobeats Dance: Essence, Origins, and Uniqueness'",
      due: "October 2nd, 2024",
    }
  },
  {
    date: "September 18th",
    title: "Intro to the CRC",
    description: "Students were given a thorough introduction to the CRC department and new CRC fellows. Discussed what to expect from the CRC, the various resources offered, and what to expect from the CRC workshops during Term 1.",
    assignment: null
  }
 
];


export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <Layout workshop={workshops}/>


     
      
    </main>
  );
}
