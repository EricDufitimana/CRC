import ScrollUp from '@/components/Common/ScrollUp';

export default function TestingPage3() {
  return (
    <main className="w-full flex justify-center pb-12 pt-16">
      <ScrollUp />
      <div className="w-[1000px] max-w-[90%] mx-auto mt-8 py-6">
        <h2 className="sr-only">New opportunities list — minimal layout for few items</h2>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-medium text-gray-900 m-0">New Opportunities</p>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 whitespace-nowrap">
            <span className="w-[7px] h-[7px] rounded-full bg-[#10b981] shrink-0"></span>
            2 available
          </span>
        </div>
        
        <div className="h-[0.5px] bg-gray-200 mb-1"></div>

        <div className="flex flex-col">
          {/* Item 1 */}
          <div className="group flex items-center gap-3.5 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer">
            <div className="w-[68px] h-[68px] rounded-[10px] shrink-0 overflow-hidden border border-gray-100 bg-gray-50">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop" 
                alt="scholarship" 
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-gray-900 m-0 overflow-hidden text-ellipsis white-space-nowrap">University Scholarship 2026</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-[#EAF3DE] text-[#3B6D11]">
                  New
                </span>
              </div>
              <p className="text-[13px] text-gray-500 m-0 line-clamp-2 leading-[1.45]">
                Full scholarship covering tuition and accommodation for eligible ASYV alumni pursuing undergraduate studies.
              </p>
              <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Closes May 18
              </span>
            </div>
            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          {/* Item 2 */}
          <div className="group flex items-center gap-3.5 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer">
            <div className="w-[68px] h-[68px] rounded-[10px] shrink-0 overflow-hidden border border-gray-100 bg-gray-50">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop" 
                alt="internship" 
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-gray-900 m-0 overflow-hidden text-ellipsis white-space-nowrap">Tech Internship — Kigali</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-[#FCEBEB] text-[#A32D2D]">
                  Due today
                </span>
              </div>
              <p className="text-[13px] text-gray-500 m-0 line-clamp-2 leading-[1.45]">
                Paid 3-month internship at a leading Kigali tech company. Open to S6 leavers with strong ICT background.
              </p>
              <span className="text-[11px] text-[#A32D2D] flex items-center gap-1 mt-0.5 font-medium">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Due today at 11:59 PM
              </span>
            </div>
            <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600 transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
