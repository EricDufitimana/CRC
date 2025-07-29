
import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import Layout from "@/components/other/Layout";
import HeaderLayout from "@/components/other/headerLayout";
import { Fragment } from "react";
import { getEnglishLanguageLearning } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

type EnglishResource = {
  _id: string;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
};

export default async function Home() {
  const data: EnglishResource[] = await client.fetch(getEnglishLanguageLearning);

  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/english.svg" />
      <div className="flex justify-center pb-12">
        <div className="content border border-gray-700 rounded-md p-8 w-[1100px]">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <Fragment key={item._id}>
                <Layout
                  image={item.image_address || "/images/banners/image.svg"}
                  title={item.title}
                  description={item.description}
                  altText="illustration"
                  double={false}
                  links={
                    item.url
                      ? [{ text: `Go to ${item.title}`, href: item.url }]
                      : [ ]
                  }
                />
                {index < data.length - 1 && (
                  <hr className="w-full my-8 border-gray-300" />
                )}
              </Fragment>
            ))
          ) : (
            <div className="text-center text-gray-500">No English learning resources found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
