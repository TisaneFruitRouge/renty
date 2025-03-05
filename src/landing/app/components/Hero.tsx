"use client";

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { WavyBackground } from "./ui/wavy-background";

export default function Hero() {
  const t = useTranslations('home.hero');
  
  return (
    <WavyBackground 
      containerClassName="h-screen flex flex-col items-center justify-center overflow-hidden"
      colors={['#e0e7ff', '#bfdbfe', '#ddd6fe', '#c7d2fe', '#e0f2fe']} 
      waveWidth={100} 
      backgroundFill="#ffffff"
      blur={10}
      waveOpacity={0.3}
      speed="slow"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Text content */}
        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('title')}
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}
              className="inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {t('cta')}
            </Link>
          </motion.div>
        </div>
        
        {/* Image/Illustration */}
        <motion.div 
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative max-w-[500px] w-full h-auto shadow-md rounded-xl">
            <Image
              src="/screenshot-hero.png"
              alt="Property management made simple"
              width={1449}
              height={877}
              className="w-full h-auto object-contain"
              style={{ aspectRatio: 'auto' }}
              priority
            />
          </div>
        </motion.div>
      </div>
    </WavyBackground>
  );
}
