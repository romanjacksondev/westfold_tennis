import { useEffect, useState } from "react";
import BasicInput from "../BasicInput";

const NewVenueForm = ({ setter }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setter({
      name,
      phone,
      address,
    });
  }, [name, phone, address]);

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
    </>
  );
};
export default NewVenueForm;
