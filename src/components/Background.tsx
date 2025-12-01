import { motion } from 'framer-motion'

export function Background() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]"
            />

            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]"
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient-to-t from-background via-transparent to-transparent" />
        </div>
    )
}
