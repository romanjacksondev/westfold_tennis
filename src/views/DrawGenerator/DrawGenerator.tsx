import DrawGeneratorTemplate from './DrawGenerator.template';
import { useSelectors } from 'store/selectors';

const DrawGeneratorView = () => {

    const { players } = useSelectors()

    return (
        <>
            <DrawGeneratorTemplate players={players} />

        </>
    )
}

export default DrawGeneratorView;