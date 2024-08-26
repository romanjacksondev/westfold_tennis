import AddPlayer from "./components/AddPlayer";

const JugadoresTemplate = ({ players }) => {

    const Styles = {
        // ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
        // TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
    };

    return (
        <>
            <AddPlayer></AddPlayer>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {players.map((player) => (
                        <tr key={player.id}>
                            <td className={Styles.TdStyle}>
                                {player.name}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default JugadoresTemplate