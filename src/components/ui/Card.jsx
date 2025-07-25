import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'p-6',
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${padding} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;