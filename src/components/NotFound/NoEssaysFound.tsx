import Image from 'next/image';
const NoEssaysFound = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Image 
        src="/images/illustrations/no-essays-image.svg"
        alt="No Essays Found"
        width={300}
        height={300}
        className="w-32 pointer-events-none z-0"
      />
      <div className="space-y-4 max-w-md mt-4">
        <h3 className="text-xl font-bold text-gray-800">
          No Essay Requests Found
        </h3>
      </div>
    </div>
  );
};

export default NoEssaysFound;
