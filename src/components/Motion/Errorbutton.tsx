import * as motion from "motion/react-client"

interface ErrorButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function ErrorButton({ onClick, className = "" }: ErrorButtonProps) {
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
            className={`w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200 relative ${className}`}
        >
            {/* First X line - flows from top-left to bottom-right */}
            <motion.svg 
                className="w-5 h-5 text-red-600 absolute" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                    duration: 0.3, 
                    delay: 0.1,
                    ease: "easeOut"
                }}
            >
                <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M6 18L18 6M6 6l12 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                        duration: 0.3, 
                        delay: 0.1,
                        ease: "easeOut"
                    }}
                />
            </motion.svg>
            
            {/* Second X line - flows from top-right to bottom-left */}
            <motion.svg 
                className="w-5 h-5 text-red-600 absolute" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                    duration: 0.3, 
                    delay: 0.3,
                    ease: "easeOut"
                }}
            >
                <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M6 6L18 18"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ 
                        duration: 0.3, 
                        delay: 0.3,
                        ease: "easeOut"
                    }}
                />
            </motion.svg>
        </motion.button>
    )
}
