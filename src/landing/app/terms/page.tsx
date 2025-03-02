"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('home.terms');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('title')}</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              {t('last_updated')}: 2 Mars 2025
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('introduction_title')}</h2>
            <p>
              {t('introduction_text')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('definitions_title')}</h2>
            <p>
              {t('definitions_text')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('services_title')}</h2>
            <p>
              {t('services_text')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('accounts_title')}</h2>
            <p>
              {t('accounts_text')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('contact_title')}</h2>
            <p>
              {t('contact_text')} <a href="mailto:support@renty.cc" className="text-blue-600 dark:text-blue-400 hover:underline">support@renty.cc</a>.
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild variant="default">
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
