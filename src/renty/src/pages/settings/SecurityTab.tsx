"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Lock } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { authClient, useSession } from "@/lib/auth-client";
import { useCurrentUserId } from "../../lib/current-user";
import { ActiveSessionsList } from "./ActiveSessionsList";
import type { SessionInfo } from "./types";

type RawSession = {
  id?: string;
  _id?: string;
  token?: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: number | string | Date | null;
  updatedAt?: number | string | Date | null;
};

function toDate(value: RawSession["createdAt"]) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function parseDeviceInfo(userAgent?: string | null): SessionInfo["deviceInfo"] {
  const ua = userAgent || "";
  const browser = ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Edg/")
      ? "Edge"
      : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
          ? "Safari"
          : "Unknown browser";
  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone") || ua.includes("iPad")
          ? "iOS"
          : ua.includes("Linux")
            ? "Linux"
            : "Unknown OS";
  const device = ua.includes("Mobile") || ua.includes("iPhone") || ua.includes("Android")
    ? "Mobile"
    : ua.includes("iPad") || ua.includes("Tablet")
      ? "Tablet"
      : "Desktop";

  return { browser, os, device };
}

export function SecurityTab() {
  const t = useTranslations("settings");
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const { data: sessionData } = useSession();
  const rawSessions = useQuery(api.settings.listSessions, userId ? { userId } : "skip") as RawSession[] | undefined;
  const deleteSession = useMutation(api.settings.deleteSession);
  const [removingSessionId, setRemovingSessionId] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const currentSession = sessionData?.session as { id?: string; _id?: string; token?: string } | undefined;
  const currentSessionId = currentSession?.id ?? currentSession?._id;

  const sessions = useMemo<SessionInfo[] | undefined>(() => {
    if (!rawSessions) return undefined;

    return rawSessions.map((session) => {
      const id = session.id ?? session._id ?? "";
      return {
        id,
        token: session.token,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: toDate(session.createdAt),
        updatedAt: toDate(session.updatedAt),
        isCurrentSession: id === currentSessionId || session.token === currentSession?.token,
        deviceInfo: parseDeviceInfo(session.userAgent),
      };
    });
  }, [currentSession?.token, currentSessionId, rawSessions]);

  const handleDisconnectSession = async (sessionId: string) => {
    if (!userId) return;

    try {
      setRemovingSessionId(sessionId);
      await deleteSession({ sessionId, userId });
      toast({
        title: t("security.session-disconnected"),
        description: t("security.session-disconnected-description"),
      });
    } catch (error) {
      console.error("Error disconnecting session:", error);
      toast({
        variant: "destructive",
        title: t("security.error-disconnecting-session"),
        description: error instanceof Error ? error.message : t("security.unknown-error"),
      });
    } finally {
      setRemovingSessionId(null);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRevokeOtherSessions(true);
  };

  const handlePasswordDialogOpenChange = (open: boolean) => {
    setPasswordDialogOpen(open);
    if (!open) resetPasswordForm();
  };

  const validatePasswordForm = () => {
    if (!currentPassword) return t("security.current-password-required");
    if (!newPassword) return t("security.new-password-required");
    if (newPassword.length < 8) return t("security.new-password-min");
    if (!confirmPassword) return t("security.confirm-password-required");
    if (newPassword !== confirmPassword) return t("security.passwords-do-not-match");
    return null;
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validatePasswordForm();
    if (validationError) {
      toast({
        variant: "destructive",
        title: t("security.password-update-error"),
        description: validationError,
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: t("security.password-update-error"),
          description: error.message || t("security.unknown-error"),
        });
        return;
      }

      toast({
        title: t("security.password-updated"),
        description: t("security.password-updated-description"),
      });
      handlePasswordDialogOpenChange(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: t("security.password-update-error"),
        description: error instanceof Error ? error.message : t("security.unknown-error"),
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>{t("tabs.security.title")}</CardTitle>
          </div>
          <CardDescription>{t("tabs.security.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-base">{t("security.password")}</h3>
              <p className="text-sm text-muted-foreground">{t("security.last-modified")}</p>
              <Button variant="outline" className="mt-1" onClick={() => setPasswordDialogOpen(true)}>
                {t("security.change-password")}
              </Button>
            </div>

            <Separator />

            <ActiveSessionsList
              sessions={sessions}
              loading={rawSessions === undefined}
              onDisconnectSession={handleDisconnectSession}
              removingSessionId={removingSessionId}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={handlePasswordDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleChangePassword} className="space-y-5">
            <DialogHeader>
              <DialogTitle>{t("security.change-password-title")}</DialogTitle>
              <DialogDescription>{t("security.change-password-description")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="current-password">
                  {t("security.current-password")}
                </label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="new-password">
                  {t("security.new-password")}
                </label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  {t("security.confirm-password")}
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground" htmlFor="revoke-other-sessions">
                <Checkbox
                  id="revoke-other-sessions"
                  checked={revokeOtherSessions}
                  onCheckedChange={(checked) => setRevokeOtherSessions(checked === true)}
                />
                {t("security.revoke-other-sessions")}
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isChangingPassword}
                onClick={() => handlePasswordDialogOpenChange(false)}
              >
                {t("security.cancel")}
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isChangingPassword ? t("security.updating-password") : t("security.change-password")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
