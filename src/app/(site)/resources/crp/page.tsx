
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/other/ResourceLayout";
import { layout } from "@/types/layout";
import HeaderLayout from "@/components/other/headerLayout";
import ResourcesNotificationBanner from "@/components/Banner/ResourcesNotificationBanner";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};


export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  const resources = [
    {
      title: "CRP Guidebook",
      link: "https://docs.google.com/document/d/1TkCtKqsWCSyutDm1jGru89bTNenK72IUlYMJmj-qisI/edit?usp=sharing"
    },
    {
      title: "CRC Recommended Universities",
      link: "https://docs.google.com/document/d/1UriRG2TZXKDYmGKtmvKrGovdh_IjFg6eh1jOSeMAkaE/edit?usp=sharing"
    },
    {
      title: "College Essay Guy",
      link: "https://www.collegeessayguy.com/#mailmunch-pop-656620"
    },
    {
      title: "College Application Course Guide",
      link: "https://docs.google.com/document/d/1JkD4tFNx1CoRfjuKzFLwjfUgur2YyrBRrx6E4AUc5wE/edit?usp=sharing"
    },
    {
      title: "Sample Personal Statements",
      link: "https://www.collegeessayguy.com/blog/personal-statement-examples"
    },
    {
      title: "The Why Us Essay Guide",
      link: "https://docs.google.com/document/d/1bHhK9NdjJUEIhN-VKSnizJBeXBSb6cE4DSR4c0-7KYs/edit?usp=sharing"
    }
  ]

  return (
    <main>
      <ScrollUp />
      <div className="space-y-4 pt-[100px]">
        <ResourcesNotificationBanner page="crp" />
        <div className="pt-12 mx-auto w-[89%]">
        <div className="mb-12  lg:mb-0">
                <h2 className="mb-5 text-3xl font-bold text-center leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2]">
                  What is the College Readiness Program
                </h2>
                <p className="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
                  The College Readiness Program was founded in 2022 to prepare ASYV&apos;s top students for the competitive application process required for admission and scholarship to American and international universities. The program begins in S5 Term 2 for qualifying students and continues throughout S6. Students will work on their applications during their time at ASYV; however, they will submit their applications after graduation. 

                  Each cohort contains 20 - 30 students, and meetings are organized by the CRC Further Education Fellow and the CRC Intern. If you would like to be part of this program, please ensure that your marks remain above 75 and watch for the application in S5. 
                </p>
        </div>
        <div className="mb-12  lg:mb-0">
                <h2 className="mb-5 text-3xl font-bold text-center leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2]">
                  Requirements
                </h2>
                <p className="mb-2 text-base leading-relaxed text-body-color ">
                  The selection requirements for the College Readiness Program is based on the requirements needed to be a competitive applicant at American and other international universities. The criteria are as follows: 
                </p>
                <ul className="space-y-4 pb-12">
                {[
                  "3.50+ GPA (in the Rwandan grading system, marks in every class need to be above 70)",
                  "130+ on Duolingo English Test",
                  "55+ score on Rwandan National Examination",
                  "Leadership experience; strong extracurriculars",
                  "Attendance at all CRC classes and CRP meetings"
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="flex-shrink-0 w-2 h-2 mt-1 mr-3 rounded-full bg-primary flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    </span>
                    <span className="text-base text-body-color transition-all duration-300 ">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
        </div>
        <div className="space-y-3 pb-12">
        <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Resources</h3>
        {resources.map((resource, key) => (
          <Link
            key={key}
            href={resource.link}
            className="group flex items-center text-body-color dark:text-gray-300 hover:text-primary transition-colors duration-200"
          >
            <span className="w-4 h-px bg-gray-400 dark:bg-gray-600 mr-2 group-hover:bg-primary group-hover:w-6 transition-all duration-300"></span>
            {resource.title}
          </Link>
        ))}
        </div>
      </div>
      </div>


     
      
    </main>
  );
}
