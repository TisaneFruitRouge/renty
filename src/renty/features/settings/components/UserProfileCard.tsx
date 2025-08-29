'use client';

import type { user } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type UserProfileCardProps = {
  user: user;
};

export function UserProfileCard({ user }: UserProfileCardProps) {
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
  
  return (
    <Card className="overflow-hidden shadow-sm border-muted hover:border-muted-foreground/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">{user.name}</h3>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Plan Basic</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
