import { useEffect, useState } from "react";
import BasicInput from "../BasicInput";

const NewVenueForm = ({ setter }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [points, setPoints] = useState("");

  useEffect(() => {
    setter({
      name,
      phone,
      address,
      points
    });
  }, [name, phone, address, points]);

  return (
    <>
      <BasicInput
        id={"venue_name"}
        text="Nombre"
        setter={setName}
        value={name}
      />
      <BasicInput
        id={"venue_phone"}
        text="Teléfono"
        setter={setPhone}
        value={phone}
      />
      <BasicInput
        id={"venue_address"}
        text="Dirección"
        setter={setAddress}
        value={address}
      />
      <BasicInput
        id={"venue_points"}
        text="Puntos Ganador"
        setter={setPoints}
        value={points}
      />
    </>
  );
};
export default NewVenueForm;
