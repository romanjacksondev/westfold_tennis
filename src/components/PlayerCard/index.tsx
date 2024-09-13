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
}: TennisPlayerProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row flex-wrap justify-center items-center space-x-4 pb-2">
        <Avatar className="h-20 w-20">
          <AvatarImage alt={name} src={imageUrl} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex-wrap">
          <CardTitle className="text-2xl text-center">{`${name} "${nickname}" ${lastname}`}</CardTitle>
          <p className="text-sm text-muted-foreground">{country}</p>
          {ranking && (
            <Badge variant="secondary" className="mt-1 flex justify-center">
              Rank #{ranking}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {points && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-center md:text-start text-muted-foreground text-rolandGarrosRed">
                Points
              </span>
              <span className="text-lg font-semibold text-center md:text-start">
                {points}
              </span>
            </div>
          )}
          <Link href={`/jugadores/${id}`}>
            <Button
              className="w-full text-rolandGarrosRed h-full"
              variant="outline"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              See Statistics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
