const InformationTemplate = () => {

    const tournamentInfo = [
        {

            categoria: "Humolabs Grand Prix",
            campeon: 4000,
            finalista: 2600,
            semifinal: 1300,
            cuartosFinal: 650
        },
        {
            categoria: "Grand Slam",
            campeon: 2000,
            finalista: 1300,
            semifinal: 800,
            cuartosFinal: 400
        },
        {
            categoria: "Masters 1000",
            campeon: 1000,
            finalista: 650,
            semifinal: 400,
            cuartosFinal: 200
        },
        {
            categoria: "ATP 500",
            campeon: 500,
            finalista: 330,
            semifinal: 200,
            cuartosFinal: 100
        },
        {
            categoria: "ATP 250",
            campeon: 250,
            finalista: 165,
            semifinal: 100,
            cuartosFinal: 50
        }]

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`
    };

    return (
        <>
            <table className="w-full table-auto">
                <thead className="text-center bg-primary">
                    <tr>
                        <th className={Styles.ThStyle}> Categoria </th>
                        <th className={Styles.ThStyle}> Campeon </th>
                        <th className={Styles.ThStyle}> Finalista </th>
                        <th className={Styles.ThStyle}> Semifinal </th>
                        <th className={Styles.ThStyle}> Cuartos de final </th>
                    </tr>
                </thead>
                <tbody className="text-center bg-primary">
                    {tournamentInfo.map((elem) => (
                        <tr key={elem.campeon}>
                            <td className={Styles.TdStyle}>{elem.categoria}</td>
                            <td className={Styles.TdStyle}>{elem.campeon}</td>
                            <td className={Styles.TdStyle}>{elem.finalista}</td>
                            <td className={Styles.TdStyle}>{elem.semifinal}</td>
                            <td className={Styles.TdStyle}>{elem.cuartosFinal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}


export default InformationTemplate