import ModalNewData from "components/ModalNewData";
import PropTypes from "prop-types";

export default function PointsBreakdown({ name, pointsBreakdown, openModal, setOpenModal }) {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    return (
        <ModalNewData
            buttonText={'Cerrar'}
            isOpen={openModal}
            onClickButton={() => setOpenModal(false)}
            setIsOpen={() => setOpenModal(false)}
            size={'lg'}
            title={`Breakdown de puntos de ${name}`}
        >
            <div className="grid grid-cols-2 gap-4 w-full">
                <table className="w-full table-auto">
                    <thead className="text-center bg-gray-300">
                        <tr>
                            <th className={Styles.ThStyle}> Puntos </th>
                            <th className={Styles.ThStyle}> Torneo </th>
                        </tr>
                    </thead>

                    <tbody className="text-center">

                        {pointsBreakdown.length > 0 && pointsBreakdown.map((elem, i) => (
                            <tr key={i}>
                                <td className={Styles.TdStyle}>{elem.tournament}</td>
                                <td className={Styles.TdStyle}>{elem.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </ModalNewData>
    )
}

PointsBreakdown.propTypes = {
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
    pointsBreakdown: PropTypes.array,
    name: PropTypes.string
};