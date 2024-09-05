import PropTypes from 'prop-types';

const SedesTemplate = ({ venues }) => {

    const Styles = {
        // ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
        // TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
        // TdButton: `inline-block px-6 py-2 border rounded border-primary text-primary hover:bg-primary hover:text-white`,
    };

    return (
        <>
            <table className="w-full table-auto">
                <thead className="text-center bg-primary">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                        <th className={Styles.ThStyle}> Puntos </th>
                        <th className={Styles.ThStyle}> Teléfono </th>
                        <th className={Styles.ThStyle}> Dirección </th>
                    </tr>
                </thead>

                <tbody className="text-center bg-primary">
                    {venues.map((venue) => (
                        <tr key={venue.id}>
                            <td className={Styles.TdStyle}>{venue.name}</td>
                            <td className={Styles.TdStyle}>{venue.points}</td>
                            <td className={Styles.TdStyle}>{venue.phone}</td>
                            <td className={Styles.TdStyle}>{venue.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

SedesTemplate.propTypes = {
    venues: PropTypes.arrayOf( 
        PropTypes.shape({})
    ).isRequired
};

export default SedesTemplate