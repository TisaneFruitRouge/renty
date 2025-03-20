"use client"; 

import { History, MessageCircle, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { property, tenant } from "@prisma/client";
import RentReceiptSettings from "./RentReceiptSettings";
import { useState, useEffect } from "react";
import { getChannelByPropertyIdAction } from "@/features/messages/actions";

interface PropertyQuickActionsProps {
    property: property;
    tenant?: tenant;
}

export function PropertyQuickActions({ property, tenant }: PropertyQuickActionsProps) {
    const t = useTranslations('property');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [channelId, setChannelId] = useState<string | null>(null);
    const [isLoadingChannel, setIsLoadingChannel] = useState(false);
    
    useEffect(() => {
        if (isContactModalOpen && tenant) {
            setIsLoadingChannel(true);
            getChannelByPropertyIdAction(property.id)
                .then((result) => {
                    if (result.success && result.data) {
                        setChannelId(result.data.id);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching channel:", error);
                })
                .finally(() => {
                    setIsLoadingChannel(false);
                });
        }
    }, [isContactModalOpen, property.id, tenant]);

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t("quick-actions")}</h2>
                <div className="space-y-3">
                    <RentReceiptSettings property={property} className="w-full" />
                    <Button variant="outline" className="w-full flex items-center justify-center">
                        <History className="w-4 h-4 mr-2" />
                        {t("rent-receipts-history")}
                    </Button>
                    <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {t("contact-tenant")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{t("contact-tenant")}</DialogTitle>
                            </DialogHeader>
                            
                            {tenant ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border p-3">
                                        <h3 className="text-sm font-medium mb-2">{tenant.firstName} {tenant.lastName}</h3>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>{tenant.email}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>{tenant.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-3">
                                        <h3 className="font-medium">{t("instant-messaging")}</h3>
                                        <p className="text-sm text-muted-foreground">{t("instant-messaging-description")}</p>
                                        
                                        {isLoadingChannel ? (
                                            <Button disabled className="w-full p-3">
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                {t("loading")}
                                            </Button>
                                        ) : channelId ? (
                                            <Link 
                                                href={`/channels/${channelId}`}
                                                className="flex items-center justify-center w-full p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                <MessageSquare className="h-5 w-5 mr-2" />
                                                {t("open-chat")}
                                            </Link>
                                        ) : (
                                            <Button disabled className="w-full p-3">
                                                <MessageSquare className="h-5 w-5 mr-2" />
                                                {t("chat-unavailable")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">
                                    {t("no-tenant-assigned")}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
