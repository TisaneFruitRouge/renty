"use client";

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { WavyBackground } from "./ui/wavy-background";
import { appHref } from "@/lib/links";

export default function Hero() {
  const t = useTranslations('home.hero');
  
  return (
    <div className="relative w-full overflow-hidden">
      <WavyBackground 
        containerClassName="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-28 pb-16 md:pt-32"
        colors={['#e0e7ff', '#bfdbfe', '#ddd6fe', '#c7d2fe', '#e0f2fe']} 
        waveWidth={100} 
        backgroundFill="#ffffff"
        blur={10}
        waveOpacity={0.3}
        speed="fast"
      >
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-4 sm:px-6 md:flex-row lg:px-8">
        {/* Text content */}
        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {t('badge')}
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('title')}
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            className="flex flex-col justify-center gap-3 sm:flex-row sm:items-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href={appHref('/sign-up')}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium leading-snug text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 sm:w-auto sm:whitespace-nowrap"
            >
              {t('cta')}
            </Link>
            <Link
              href="#features"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-primary/20 bg-background px-6 py-3 text-center font-medium leading-snug shadow-sm transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 sm:w-auto sm:whitespace-nowrap"
            >
              {t('secondary_cta')}
            </Link>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {t('trust_line')}
          </motion.p>
        </div>
        
        {/* Image/Illustration */}
        <motion.div 
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border border-border/60 bg-white shadow-lg">
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
    </div>
  );
}
