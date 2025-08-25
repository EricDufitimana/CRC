import * as motion from "motion/react-client"

interface SuccessButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function SuccessButton({ onClick, className = "" }: SuccessButtonProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: 0.05, // Wait for toast slide-in to complete (0.5s) + small buffer
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.3, delay: 0.05 },
            }}
            onClick={onClick}
            className={`w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors duration-200 relative ${className}`}
        >
            {/* Checkmark icon with animated drawing */}
            <motion.svg 
                className="w-5 h-5 text-green-600 absolute" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                    duration: 0.4, 
                    delay: 0.1,
                    ease: "easeOut"
                }}
            >
                <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                        duration: 0.4, 
                        delay: 0.1,
                        ease: "easeOut"
                    }}
                />
            </motion.svg>
        </motion.button>
    )
}
