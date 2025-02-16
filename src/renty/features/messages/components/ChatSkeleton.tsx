import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Message list skeleton */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-[250px]" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Message input skeleton */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-16" />
                </div>
            </div>
        </div>
    );
}
