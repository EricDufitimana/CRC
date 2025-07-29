import Image from "next/image";
import Link from "next/link";

interface workshopAssignment{
  task:string;
  due:string;
}
interface workshopLayout{
  date: string;
  title: string;
  description:string;
  assignment?: workshopAssignment;

}

export default function WorkshopsPage({workshop}: { workshop : workshopLayout[]}) {
  return (
    <main className="container ">
      <header className="mb-16 text-center mx-auto px-4 pt-[200px]">
        <h1 className="text-4xl font-bold text-dark mb-4">CRC Workshop Archive</h1>
        <p className="text-lg text-body-color max-w-3xl mx-auto">
          A complete record of all CRC workshops with descriptions, presentations, and assignments.
        </p>
      </header>
      <section className="space-y-12 w-full  rounded-2xl p-8 bg-gray-1">
        {workshop.map((workshop, index) => (
          <div key={index} className="border-b border-gray-200 pb-8">
            <h3 className="text-xl font-semibold text-primary pb-4">{workshop.date}</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="md:w-2/4 flex flex-col gap-2">
                <img src="/images/banners/image.svg" alt=""  className="w-[320px] "/>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-2xl font-bold text-dark mb-2">{workshop.title}</h4>
                <p className="text-lg text-body-color mb-4 font-normal">{workshop.description}</p>
                
                {workshop.assignment && (
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-dark mb-2 ">Assignment:</h5>
                    <p className="mb-2 font-normal text-md text-gray-700">{workshop.assignment.task}</p>
                    <p className="text-sm font-medium text-red-500">Due: {workshop.assignment.due}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}