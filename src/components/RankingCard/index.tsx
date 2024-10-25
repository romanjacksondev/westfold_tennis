import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "components/Button";
import PropTypes from "prop-types";
import PointsBreakdown from "views/Leaderboard/components/PointsBreakdown";
import { useState } from "react";

export default function RankingCard({
  name,
  lastname,
  imageUrl,
  nickname,
  ranking,
  points,
  pointsBreakdown
}) {

  const [openModal, setOpenModal] = useState(false)

  const handleOnClick = () => {
    setOpenModal(true)
  }
  // console.log("points: ", pointsBreakdown)
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
          {ranking && (
            <Badge variant="secondary" className="mt-1 flex justify-center">
              Puesto #{ranking}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {points && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-center md:text-start text-muted-foreground text-rolandGarrosRed">
                Puntos
              </span>
              <span className="text-lg font-semibold text-center md:text-start">
                {points}
              </span>
            </div>
          )}

          <Button
            className="w-full text-rolandGarrosRed h-full"
            variant="outline"
            onClick={handleOnClick}
          >
            Breakdown de puntos
          </Button>
          {openModal && (<PointsBreakdown
            name={name}
            pointsBreakdown={pointsBreakdown}
            openModal={openModal}
            setOpenModal={setOpenModal}
          ></PointsBreakdown>)}


        </div>
      </CardContent>
    </Card>
  );
}

RankingCard.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  lastname: PropTypes.string,
  imageUrl: PropTypes.string,
  nickname: PropTypes.string,
  ranking: PropTypes.number,
  points: PropTypes.number,
  pointsBreakdown: PropTypes.array
};