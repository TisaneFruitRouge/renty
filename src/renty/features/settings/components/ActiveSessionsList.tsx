'use client';

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { SessionInfo } from "../actions";

interface ActiveSessionsListProps {
  sessions?: SessionInfo[];
  loading: boolean;
  onDisconnectSession: (sessionId: string) => Promise<void>;
  removingSessionId: string | null;
}

export function ActiveSessionsList({
  sessions,
  loading,
  onDisconnectSession,
  removingSessionId
}: ActiveSessionsListProps) {
  const t = useTranslations('settings');
  const router = useRouter();

  // Format the last activity time
  const formatLastActivity = (date: Date | null) => {
    if (!date) return t('security.unknown-time');
    
    const now = new Date();
    const activityDate = new Date(date);
    
    // If it's today, show relative time (e.g., "2 hours ago")
    if (activityDate.toDateString() === now.toDateString()) {
      return t('security.last-active', { time: formatDistanceToNow(activityDate, { addSuffix: true }) });
    }
    
    // If it's yesterday, show "Yesterday at HH:MM"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return t('security.last-active-yesterday', { time: format(activityDate, 'HH:mm') });
    }
    
    // Otherwise, show the full date
    return t('security.last-active-date', { date: format(activityDate, 'PPP') });
  };

  // Format device info for display
  const formatDeviceInfo = (session: SessionInfo) => {
    const { deviceInfo } = session;
    
    if (deviceInfo.device && deviceInfo.device !== 'Desktop') {
      return `${deviceInfo.device} • ${deviceInfo.os}`;
    }
    
    return `${deviceInfo.browser} • ${deviceInfo.os}`;
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-base">{t('security.active-sessions')}</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>{t('security.loading-sessions')}</span>
        </div>
      ) : sessions === undefined || sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('security.no-active-sessions')}
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y">
          {sessions.map(session => (
            <div key={session.id} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    {session.isCurrentSession ? 
                      t('security.this-device') : 
                      formatDeviceInfo(session)
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatLastActivity(session.updatedAt || session.createdAt)}
                  </p>
                </div>
                {session.isCurrentSession ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => router.push('/api/auth/signout')}
                  >
                    {t('security.sign-out')}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDisconnectSession(session.id)}
                    disabled={removingSessionId === session.id}
                  >
                    {removingSessionId === session.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        {t('security.disconnecting')}
                      </>
                    ) : (
                      t('security.disconnect')
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
