"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";

const SUPPORT_EMAIL = "support@renty.cc";
const ONBOARDING_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Configuration gratuite de mon premier bien",
)}&body=${encodeURIComponent(
  [
    "Bonjour,",
    "",
    "Je souhaite être accompagné pour configurer mon premier bien sur Renty.",
    "",
    "Nombre de biens que je gère :",
    "Ville / région :",
    "Disponibilités pour un échange :",
    "",
    "Merci !",
  ].join("\n"),
)}`;

export default function FounderConfig() {
  const t = useTranslations("home.founderConfig");

  const bullets = [t("bullet1"), t("bullet2"), t("bullet3"), t("bullet4")];
  const steps = [
    { title: t("card_step1_title"), subtitle: t("card_step1_subtitle") },
    { title: t("card_step2_title"), subtitle: t("card_step2_subtitle") },
    { title: t("card_step3_title"), subtitle: t("card_step3_subtitle") },
    { title: t("card_step4_title"), subtitle: t("card_step4_subtitle") },
  ];

  return (
    <section id="founder-config" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                {t("badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t("subtitle")}</p>
              <ul className="space-y-3 mb-8">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={ONBOARDING_MAILTO}
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary hover:bg-primary/90 px-6 font-medium text-primary-foreground transition-colors"
              >
                {t("cta")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm"
            >
              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
