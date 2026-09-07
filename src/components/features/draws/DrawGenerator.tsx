import { useSelectors } from 'store/selectors';
import DrawGeneratorTemplate from './components/DrawGenerator.template';

const DrawGeneratorView = () => {
  const { players } = useSelectors();

  return (
    <>
      <DrawGeneratorTemplate players={players} />
    </>
  );
};

export default DrawGeneratorView;
