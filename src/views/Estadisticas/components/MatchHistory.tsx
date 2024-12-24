import BaseTable from "components/BaseTable/BaseTable";
import { Button } from "components/Button";
import { Select } from "components/Select";
import { TextHeadingH4 } from "components/Text";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import { createColumnHelper } from "@tanstack/react-table";

const MatchHistory = () => {
    const { getMatchHistory } = useActions();
    const { getValues, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { players } = useSelectors()
    const [matches, setMatches] = useState([]);

    const handleOnClick = async () => {
        const values = getValues()
        if (values.player1 && values.player2) {

            const ids = { player1Id: values.player1.id, player2Id: values.player2.id }
            const data = await getMatchHistory(ids);
            console.log(data)
            setMatches(data)
        }
    }
    const columnHelper = createColumnHelper<any>();
    const columns = [
        ...[
          columnHelper.accessor("tournamentName", {
            id: "tournamentName",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Torneo</span>,
          }),
          columnHelper.accessor("player1", {
            id: "player1",
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Nombre</span>,
          }),
          columnHelper.accessor("result", {
            id: "result",
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Resultado</span>,
          }),
          columnHelper.accessor("player2", {
            id: "player2",
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Nombre</span>,
          }),
        ],
      ];

    return (
        <>
            <TextHeadingH4>Match History</TextHeadingH4>
            <div className="grid grid-cols-3 gap-4 w-full">
                <Select
                    name="player1"
                    placeholder="Ej. Ale"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Jugador 1
                </Select>
                <Select
                    name="player2"
                    placeholder="Ej. Rofer"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Jugador 2
                </Select>
                <Button
                    className="w-40 text-rolandGarrosRed h-full"
                    variant="outline"
                    onClick={handleOnClick}
                >
                    Buscar
                </Button>
            </div>

            {matches && 
             <BaseTable data={matches} title="Historial de Partidos" columns={columns} />
            }
            
        </>
    )
}


export default MatchHistory;