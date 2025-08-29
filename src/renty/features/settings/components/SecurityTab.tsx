'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";
import { useState } from "react";
import { getActiveSessionsAction, removeSessionAction, type SessionInfo } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ActiveSessionsList } from "./ActiveSessionsList";

type SecurityTabProps = {
  initialSessions?: SessionInfo[];
};

export function SecurityTab({ initialSessions }: SecurityTabProps) {
  const t = useTranslations('settings');
  const { toast } = useToast();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[] | undefined>(initialSessions);
  const [loading, setLoading] = useState(false);
  const [removingSessionId, setRemovingSessionId] = useState<string | null>(null);

  // Refresh sessions if needed
  const refreshSessions = async () => {
    try {
      setLoading(true);
      const result = await getActiveSessionsAction();
      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        toast({
          variant: "destructive",
          title: t('security.error-fetching-sessions'),
          description: result.error || t('security.unknown-error')
        });
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        variant: "destructive",
        title: t('security.error-fetching-sessions'),
        description: error instanceof Error ? error.message : t('security.unknown-error')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSession = async (sessionId: string) => {
    try {
      setRemovingSessionId(sessionId);
      const result = await removeSessionAction(sessionId);
      
      if (result.success) {
        // Remove the session from the local state
        setSessions(prev => prev?.filter(session => session.id !== sessionId));
        
        // Refresh sessions to ensure consistency
        await refreshSessions();
        
        toast({
          title: t('security.session-disconnected'),
          description: t('security.session-disconnected-description')
        });
      } else {
        toast({
          variant: "destructive",
          title: t('security.error-disconnecting-session'),
          description: result.error || t('security.unknown-error')
        });
      }
    } catch (error) {
      console.error("Error disconnecting session:", error);
      toast({
        variant: "destructive",
        title: t('security.error-disconnecting-session'),
        description: error instanceof Error ? error.message : t('security.unknown-error')
      });
    } finally {
      setRemovingSessionId(null);
      router.refresh();
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>{t('tabs.security.title')}</CardTitle>
        </div>
        <CardDescription>{t('tabs.security.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-base">{t('security.password')}</h3>
            <p className="text-sm text-muted-foreground">{t('security.last-modified')}</p>
            <Button variant="outline" className="mt-1">{t('security.change-password')}</Button>
          </div>
          
          <Separator />
          
          <ActiveSessionsList 
            sessions={sessions}
            loading={loading}
            onDisconnectSession={handleDisconnectSession}
            removingSessionId={removingSessionId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
