"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const t = useTranslations('home.footer');
  
  // Simplified footer links
  const footerLinks = [
    { name: t('product_features'), href: '/#features' },
    { name: t('product_pricing'), href: '/#pricing' },
    { name: t('legal_terms'), href: '/terms' },
    { name: t('legal_privacy'), href: '/privacy' },
    { name: t('company_contact'), href: '/contact' }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <div className="h-8 w-24 relative flex items-center justify-start">
                <Image
                  src="/renty.svg"
                  alt="Renty Logo"
                  width={96}
                  height={28}
                  priority
                  className="object-contain"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
          
          {/* Simplified links */}
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Button 
                key={link.name}
                asChild
                variant="link"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-0 h-auto"
              >
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Renty. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
