import React from 'react';
import { motion } from 'framer-motion';

const AnimatedAvatar = () => {
  return (
    <motion.div
      className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: ["0 0 0px 0px rgba(59, 130, 246, 0.7)", "0 0 10px 5px rgba(59, 130, 246, 0)", "0 0 0px 0px rgba(59, 130, 246, 0.7)"],
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0,
      }}
    >
      <span className="text-white text-lg font-bold">AI</span>
    </motion.div>
  );
};

export default AnimatedAvatar;
