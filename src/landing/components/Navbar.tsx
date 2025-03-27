"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const t = useTranslations('home.navbar');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation links
  const navLinks = [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Pour les propriétaires', href: '#landlord-features' },
    { name: 'Pour les locataires', href: '#tenant-features' },
    { name: 'Tarifs', href: '#pricing' },
    { name: 'Contact', href: '/contact' }
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
            ? 'backdrop-blur-md shadow-md py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 relative">
                <Image
                  src="/logo.png"
                  alt="Renty Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="ml-2 text-xl font-bold">
                Renty
              </span>
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* CTA buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}
                className="text-sm font-medium"
              >
                {t('login')}
              </Link>
              
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}
                className="inline-flex h-10 items-center justify-center rounded-md text-primary-foreground bg-primary hover:bg-primary/90 p-4"
              >
                {t('signup')}
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center"
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
            className="fixed inset-x-0 top-16 z-40 bg-white dark:bg-gray-900 shadow-lg md:hidden"
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
                  href="/login"
                  className="block text-base font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                
                <Link
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}
                  className="block w-full py-3 px-4 rounded-md text-center font-medium text-white bg-black hover:bg-gray-800 transition-colors"
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
