'use client';
import { generateDraw } from '@/utils/utils';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import Select from 'react-select';

const DrawGeneratorTemplate = ({ players }) => {
  const [matches, setMatches] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const playerOptions = players.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const handleChange = (optionsArray) => {
    setSelectedOptions(optionsArray);
    // optionsArray is an array of objects
    console.log(
      'Selected values:',
      optionsArray.map((option) => option.value),
    );
  };

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
    const draw = generateDraw(selectedOptions.length, shuffleArray(selectedOptions));
    const resultado = shuffleArray(draw);
    setMatches(resultado);
  };

  const MatchItem = ({ match }) => {
    console.log('Match:', match);
    return (
      <div className="match-item">
        <div className="players">
          {match[0].label} vs {match[1].label}
        </div>
      </div>
    );
  };

  const Round = ({ round, index }) => {
    console.log('Round:', round);
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
  return (
    <>
      Generador de Enfrentamientos
      <div className="grid grid-cols-2 gap-4 w-full">
        <Select options={playerOptions} isMulti onChange={handleChange} />

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
  );
};

export default DrawGeneratorTemplate;
