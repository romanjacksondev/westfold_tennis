import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TennisPlayerProps } from "views/Jugadores/Jugadores.template";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import Link from "next/link";

export default function PlayerCard({
  id,
  name,
  lastname,
  country,
  imageUrl,
  nickname,
  ranking,
  points,
  grandSlams,
}: TennisPlayerProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar className="h-20 w-20">
          <AvatarImage alt={name} src={imageUrl} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl">{`${name} "${nickname}" ${lastname}`}</CardTitle>
          <p className="text-sm text-muted-foreground">{country}</p>
          {ranking && (
            <Badge variant="secondary" className="mt-1">
              Rank #{ranking}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {points && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground text-rolandGarrosRed">
                Points
              </span>
              <span className="text-lg font-semibold">{points}</span>
            </div>
          )}
          {grandSlams && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground text-rolandGarrosRed">
                Grand Slams
              </span>
              <span className="text-lg font-semibold">{grandSlams}</span>
            </div>
          )}
        </div>
        <Link href={`/jugadores/${id}`}>
          <Button
            className="w-full text-rolandGarrosRed mt-6"
            variant="outline"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            See Statistics
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
