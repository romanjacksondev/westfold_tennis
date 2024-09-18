import { Button } from 'components/Button';
import MultiSelect from 'components/MultiSelect/MultiSelect';
import { TextHeadingH4 } from 'components/Text';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const DrawGeneratorTemplate = ({ players }) => {

  const { getValues, control } = useForm({ mode: 'onSubmit' })
  const [ rounds, setRounds] = useState(0)
  const [ matches, setMatches] = useState([])

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiamos los elementos
    }
  }

  const onSubmit = async () => {
    const values = getValues()
    console.log(values)

    const matches = [];

    // Generamos todos los partidos posibles (round-robin)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          player1: players[i],
          player2: players[j],
        });
      }
    }
  
    // Mezclamos los partidos para que el orden sea aleatorio
    console.log("matches ori: ", matches)
    shuffleArray(matches);
    setMatches(matches)
    console.log("matches shuf: ", matches)
    console.log("rounds: ",values.players.length-1)
    setRounds(values.players.length-1)
    // if (response) {
    //   toast.success("Torneo creado!")
    // } else {
    //   toast.success("Torneo NO creado!")
    // }
  }

  const MatchItem = ({ match }) => {
    return (
      <div className="match-item">
        <div className="players">
          <span>{match.player1.name}</span> vs <span>{match.player2.name}</span>
        </div>
      </div>
    );
  };

  const Round = ({ round }) => {
    console.log("in rounds")
    return (
      <div className="round">
        <h3>{round}</h3>
        <div className="matches">
          {matches.map((match, index) => (
            <MatchItem key={index} match={match} />
          ))}
        </div>
      </div>
    );
  };

console.log("rounds out: ", rounds)

  return (
    <>
      <TextHeadingH4>Generador de Schedule</TextHeadingH4>
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
      { rounds > 0 && new Array(Array(rounds).keys()).map((round, index) => (
        <Round key={index} round={round} />
      ))}
    </div>

    </>
  )
}

DrawGeneratorTemplate.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired
};

export default DrawGeneratorTemplate