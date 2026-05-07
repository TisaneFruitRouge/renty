"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { appHref } from '@/lib/links';

export default function Navbar() {
  const t = useTranslations('home.navbar');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation links
  const navLinks = [
    { name: t('pains'), href: '#pains' },
    { name: t('features'), href: '#features' },
    { name: t('configuration'), href: '#founder-config' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('contact'), href: '/contact' }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'border-b border-border/60 bg-white/90 py-3 shadow-sm backdrop-blur-md dark:bg-gray-950/90'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="h-10 w-32 relative flex items-center justify-center">
                <Image
                  src="/renty.svg"
                  alt="Renty Logo"
                  width={120}
                  height={36}
                  priority
                  className="object-contain"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* CTA buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={appHref('/sign-in')}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                {t('login')}
              </Link>
              
              <Link
                href={appHref('/sign-up')}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              >
                {t('signup')}
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 items-center justify-center rounded-md md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className={`relative w-6 h-5 transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
                <span 
                  className={`absolute h-0.5 w-6 bg-gray-800 dark:bg-white transform transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-0'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 bg-gray-800 dark:bg-white transform transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 translate-x-3' : 'opacity-100 translate-x-0 w-6 translate-y-2'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-gray-800 dark:bg-white transform transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-2.5' : 'translate-y-4'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            id="mobile-navigation"
            className="fixed inset-x-0 top-16 z-40 border-b border-border/70 bg-white shadow-lg dark:bg-gray-900 md:hidden"
          >
            <div className="px-4 py-6 space-y-6">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-base font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={appHref('/sign-in')}
                  className="block text-base font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                
                <Link
                  href={appHref('/sign-up')}
                  className="block w-full rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('signup')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
