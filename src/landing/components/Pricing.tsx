"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Pricing() {
  const t = useTranslations('home.pricing');
  const commonT = useTranslations('home');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Define the type for pricing plans
  type PricingPlan = {
    name: string;
    description: string;
    monthlyPrice: number | null;
    yearlyPrice: number | null;
    features: string[];
    cta: string;
    popular: boolean;
    priceLabel?: string;
  };
  
  // Pricing plans data with translations
  const plans: PricingPlan[] = [
    {
      name: t('basic_plan'),
      description: t('basic_description'),
      monthlyPrice: 9.99,
      yearlyPrice: 95.88, // 20% discount for yearly
      features: t.raw('basic_features'),
      cta: commonT('hero.cta'),
      popular: false
    },
    {
      name: t('pro_plan'),
      description: t('pro_description'),
      monthlyPrice: 24.99,
      yearlyPrice: 239.88, // 20% discount for yearly
      features: t.raw('pro_features'),
      cta: commonT('hero.cta'),
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">{t('subtitle')}</p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('monthly')}
            </span>
            
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
            
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('yearly')} <span className="text-green-600 font-semibold">{t('save')}</span>
            </span>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden",
                plan.popular && "ring-2 ring-primary dark:ring-gray-300"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold py-1 px-3 rounded-bl-lg">
                  {t('popular')}
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-8">
                  {plan.monthlyPrice !== null ? (
                    <>
                      <span className="text-4xl font-bold">
                        {billingCycle === 'monthly' 
                          ? `${plan.monthlyPrice.toFixed(2)}€` 
                          : `${plan.yearlyPrice?.toFixed(2)}€`}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {billingCycle === 'monthly' ? t('period.monthly') : t('period.yearly')}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">{plan.priceLabel}</span>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start">
                      <svg className="h-5 w-5 text-black dark:text-gray-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-colors",
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90" 
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold mb-8 text-center">{t('faq_title')}</h3>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-2">{t('faq1_question')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('faq1_answer')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-2">{t('faq2_question')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('faq2_answer')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold mb-2">{t('faq3_question')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('faq3_answer')}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('guarantee')}
          </p>
        </div>
      </div>
    </section>
  );
}
