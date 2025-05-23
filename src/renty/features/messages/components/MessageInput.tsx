"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

type MessageInputProps = {
    onSendMessage: (content: string) => Promise<void>;
};

export function MessageInput({ onSendMessage }: MessageInputProps) {
    const t = useTranslations("messages");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        try {
            setIsSending(true);
            await onSendMessage(message.trim());
            setMessage("");
            textareaRef.current?.focus();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex items-stretch gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("input.placeholder")}
                    className="resize-none"
                    rows={1}
                    disabled={isSending}
                />
                <Button 
                    type="submit" 
                    disabled={!message.trim() || isSending} 
                    className="px-3 h-16"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
