import Image from 'next/image';

export default function FaqCard({numberQn, question, answer, top, left, degrees, backgroundColor, image}: {numberQn: string, question: string, answer: string, top: number, left: number, degrees: number, backgroundColor: string, image: string}) {

  return (
    <div className={`w-full max-w-sm p-4 bg-white   shadow-2xl rounded-2xl`}
    style={{rotate: `${degrees}deg`}}
    >
      <div className="space-y-4 pt-8 relative">
        <Image 
          src={`/images/faq/pin-${image}`}
          alt="pin"
          width={100}
          height={100}
          className="absolute"
          style={{ top: `${top}px`, left: `${left}px` }}
        />

        <div className="p-4 rounded-lg pt-4" style={{ backgroundColor: `${backgroundColor}B3` }}>
          <h2 className="text-2xl font-medium text-gray-800 mb-2 font-cal-sans ">{numberQn}</h2>
          <h3 className="font-medium text-md text-dark">{question}</h3>
          <p className="text-gray-600 text-sm">{answer}</p>
        </div>
      </div>
    </div>
  );
}