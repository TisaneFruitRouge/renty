"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('home.contact');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 relative">
              <Image
                src="/logo.png"
                alt="Renty Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            {t('title')}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
            {t('subtitle')}
          </p>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-center w-full max-w-md p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <svg 
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-medium select-all">support@renty.cc</span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              {t('response_time')}
            </p>
            
            <Button asChild variant="default" className="mt-8">
              <Link href="/">
                {t('return_home')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
