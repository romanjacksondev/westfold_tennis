import { useSelectors } from "store/selectors";
import SedesTemplate from "./Sedes.template";

const SedesView = () => {

  const { venues } = useSelectors()

  return (
    <SedesTemplate venues={venues}></SedesTemplate>
  );
};

export default SedesView;
