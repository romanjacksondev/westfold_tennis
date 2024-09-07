import PropTypes from 'prop-types';

const SedesTemplate = ({ venues }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`
    };

    return (
        <>
            <table className="w-full table-auto">
                <thead className="text-center bg-primary">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                        <th className={Styles.ThStyle}> Teléfono </th>
                        <th className={Styles.ThStyle}> Dirección </th>
                    </tr>
                </thead>

                <tbody className="text-center bg-primary">
                    {venues.map((venue) => (
                        <tr key={venue.id}>
                            <td className={Styles.TdStyle}>{venue.name}</td>
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