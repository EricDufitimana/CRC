import { Search } from 'lucide-react';
import Image from 'next/image'

const NoOpportunitiesFound = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
       <Image
         src="/images/illustrations/no-opportunities-image.svg"
        alt="No Opportunities Found"
        width={200}
        height={200}
        className="w-32 pointer-events-none z-0"
        /> 
      
      {/* Text content */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-xl font-bold text-gray-800">
          No Opportunities Found
        </h3>
      </div>
    </div>
  );
};

export default NoOpportunitiesFound;