import PlayerCard from "components/PlayerCard";
import { TextBodyXs, TextHeadingH4 } from "components/Text";
import { calculatePlayerPoints } from "lib/helpers";
import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useActions } from "store/actions";

export type TennisPlayerProps = {
  id: string;
  name: string;
  lastname: string;
  nickname: string;
  country?: string;
  ranking?: number;
  points: number;
  winLossRatio?: string;
  grandSlams?: number;
  imageUrl: string;
};

const JugadoresTemplate = ({ players }: { players: TennisPlayerProps[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg bg-rolandGarrosOrange p-10">
      {players.map((player, i) => (
        <PlayerCard
          id={player.id}
          ranking={i + 1}
          points={player.points}
          name={player.name}
          lastname={player.lastname}
          imageUrl={`/img/avatar/${player.nickname.replace(" ", "").toLowerCase()}.jpeg`}
          nickname={player.nickname}
        />
      ))}
    </div>
  );
};

export default JugadoresTemplate;
