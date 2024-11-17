import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Properties
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col items-center justify-center text-center">
                        <Home className="h-12 w-12 text-muted-foreground mb-4" />
                        <h1 className="text-2xl font-bold">Property Not Found</h1>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        <p>The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                        <div className="mt-6">
                            <Link href="/">
                                <Button>
                                    <Home className="mr-2 h-4 w-4" />
                                    Return to Properties
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
