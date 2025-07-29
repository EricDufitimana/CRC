import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.5998 1.01245H5.39981C2.98105 1.01245 0.956055 2.9812 0.956055 5.4562V30.6562C0.956055 33.075 2.9248 35.0437 5.39981 35.0437H30.5998C33.0186 35.0437 34.9873 33.075 34.9873 30.6562V5.39995C34.9873 2.9812 33.0186 1.01245 30.5998 1.01245ZM5.39981 3.48745H30.5998C31.6123 3.48745 32.4561 4.3312 32.4561 5.39995V11.1937H3.4873V5.39995C3.4873 4.38745 4.38731 3.48745 5.39981 3.48745ZM3.4873 30.6V13.725H23.0623V32.5125H5.39981C4.38731 32.5125 3.4873 31.6125 3.4873 30.6ZM30.5998 32.5125H25.5373V13.725H32.4561V30.6C32.5123 31.6125 31.6123 32.5125 30.5998 32.5125Z"
          fill="white"
        />
      </svg>
    ),
    title: "Further Education",
    paragraph: "The ASYV (Agahozo-Shalom Youth Village) Further Education track supports students in pursuing higher education. Over 50% of ASYV graduates attend university. This track assists students with university and scholarship applications. Many high-achieving students secure full scholarships to universities in Rwanda (RICA, UGHE, ALU) and internationally (USA, Canada, Italy, China, Ghana, Kenya). Other students attend Rwandan universities using study loans.",

  },
  {
    id: 2,
    icon: (
      <svg
        width="37"
        height="37"
        viewBox="0 0 37 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lightbulb (idea) */}
        <path
          d="M18.5 8V4M18.5 4C12.5 4 8 10 8 16C8 20 10 22 12 24V26C12 28 14 30 16 30H21C23 30 25 28 25 26V24C27 22 29 20 29 16C29 10 24.5 4 18.5 4Z"
          stroke="white"
          strokeWidth="2"
        />
        {/* Graph line (growth) */}
        <path
          d="M12 20L16 16L20 20L24 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Graph dots */}
        <circle cx="12" cy="20" r="1.5" fill="white" />
        <circle cx="16" cy="16" r="1.5" fill="white" />
        <circle cx="20" cy="20" r="1.5" fill="white" />
        <circle cx="24" cy="16" r="1.5" fill="white" />
      </svg>
    ),
    title: "Entrepreneurship",
    paragraph: "We want ASYV students to be able to create their own jobs and opportunities. The Entrepreneurship track focuses on teaching students to start their own businesses. In order to do this, we work alongside the Entrepreneurship teachers to facilitate the Business Plan Competition, where students work in groups to create and pitch businesses. Through this experience, students acquire the skills they need to build their own companies.",

  },
  {
    id: 3,
    icon: (
      <svg
        width="37"
        height="37"
        viewBox="0 0 37 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Briefcase (symbolizing work) */}
        <path
          d="M28 13H9C7.34315 13 6 14.3431 6 16V28C6 29.6569 7.34315 31 9 31H28C29.6569 31 31 29.6569 31 28V16C31 14.3431 29.6569 13 28 13Z"
          stroke="white"
          strokeWidth="2"
        />
        {/* Briefcase handle */}
        <path
          d="M22 13V11C22 9.34315 20.6569 8 19 8H18H15C13.3431 8 12 9.34315 12 11V13"
          stroke="white"
          strokeWidth="2"
        />
        {/* Checkmark (symbolizing readiness) */}
        <path
          d="M14 21L17 24L23 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Work Readiness",
    paragraph: "The ASYV Entrepreneurship track empowers students to create their own jobs and opportunities by teaching them to start their own businesses. This involves collaborating with Entrepreneurship teachers to facilitate a Business Plan Competition. Students work in groups to develop and pitch business ideas, gaining the necessary skills to build their own companies. ",

  },


];
export default featuresData;
