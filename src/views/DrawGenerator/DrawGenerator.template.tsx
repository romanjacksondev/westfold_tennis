import { Button } from 'components/Button';
import MultiSelect from 'components/MultiSelect/MultiSelect';
import { TextHeadingH4 } from 'components/Text';
import { generateDraw } from 'lib/helpers';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const DrawGeneratorTemplate = ({ players }) => {

  const { getValues, control } = useForm({ mode: 'onSubmit' })
  const [matches, setMatches] = useState([])

  function shuffleArray(array) {
    const n = 5;
    for (let m = 0; m < n; m++) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    return array;
  }

  const onSubmit = async () => {
    const values = getValues()
    const draw = generateDraw(values.players.length, shuffleArray(values.players))
    const resultado = shuffleArray(draw);
    setMatches(resultado)
  }

  const MatchItem = ({ match }) => {
    return (
      <div className="match-item">
        <div className="players">
          {match[0].name} vs {match[1].name}
        </div>
      </div>
    );
  };

  MatchItem.propTypes = {
    match: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
  };

  const Round = ({ round, index }) => {
    return (
      <div className="round">

        <div className="matches">
          <h3>Round {index + 1}</h3>
          {round.map((r, i) => (
            <>
              <MatchItem key={i} match={r} />
            </>
          ))}
        </div>
      </div>
    );
  };

  Round.propTypes = {
    round: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired
    ).isRequired,
    index: PropTypes.number.isRequired,
  };

  return (
    <>
      <TextHeadingH4>Generador de Enfrentamientos</TextHeadingH4>
      <div className="grid grid-cols-2 gap-4 w-full">
        <MultiSelect
          label={""}
          options={
            players
          }
          placeholder={"Participantes"}
          name="players"
          control={control}
          rules={{ required: "Requerido" }}
          isDisabled={false}
          isLoading={false}
          optionLabel={"name"}
          optionValue={"id"}
          defaultValue={[]}
        />
        <Button onClick={onSubmit} className="w-40">
          Generar
        </Button>
      </div>


      <div className="tournament-matches">
        {matches.map((round, index) => (
          <Round key={index} round={round} index={index} />
        ))}
      </div>

    </>
  )
}

DrawGeneratorTemplate.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired
    })
  ).isRequired
};

export default DrawGeneratorTemplate