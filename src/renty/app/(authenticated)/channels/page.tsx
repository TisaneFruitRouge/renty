import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ChannelListPage() {
    const t = useTranslations();

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="mt-6 text-2xl font-semibold">
                    {t("messages.default-page.title")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t("messages.default-page.description")}
                </p>
            </div>
        </div>
    );
}