/** @format */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextHeadingH4 } from "components/Text";
import { CircleDot } from "lucide-react";
import PropTypes from "prop-types";

const HeadTemplate = ({ h2h }) => {
  const jugadores = Object.keys(h2h);

  return (
    <Card className="w-full">
      <CardHeader className=" text-white bg-rolandGarrosRed border-b-2 border-solid border-black">
        <CardTitle className="text-2xl sm:text-4xl font-bold flex items-center">
          <CircleDot className="w-8 h-8 mr-2" />
          Head 2 Head
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <Table className="text-xl">
            <TableHeader className="font-bold bg-rolandGarrosRed">
              <TableRow>
                <TableHead className="text-gray-300"> Jugador </TableHead>
                {jugadores.map((jugador) => (
                  <TableCell key={jugador}>{jugador}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jugadores.map((jugador1, i) => (
                <TableRow
                  key={jugador1}
                  className={`${i % 2 ? "bg-orange-300" : "bg-orange-500"}`}
                >
                  <TableCell>{jugador1}</TableCell>
                  {jugadores.map((jugador2) => (
                    <TableCell key={jugador2}>
                      {h2h[jugador1] == h2h[jugador2] ? (
                        <div>-</div>
                      ) : (
                        <>
                          <div>
                            <strong>Ganados:</strong>{" "}
                            {h2h[jugador1].won[jugador2] || 0}
                          </div>
                          <div>
                            <strong>Perdidos:</strong>{" "}
                            {h2h[jugador1].lost[jugador2] || 0}
                          </div>
                        </>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

HeadTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired,
};

export default HeadTemplate;
