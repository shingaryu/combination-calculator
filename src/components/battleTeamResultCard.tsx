import React from 'react';
import { Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import './battleTeamResultCard.css'
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';

type BattleTeamResultCardProps = {
  index: number,
  result: BattleTeamSearchResult
}

export const BattleTeamResultCard: React.FunctionComponent<BattleTeamResultCardProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="result-card">
        <div className="text-area">
          <div>
            <span>{props.index}. Evaluation: </span>
            <span className={props.result.value < 0? "value-text color-red": "value-text color-blue"}>
              {props.result.value.toFixed(0)}
            </span> 
          </div>
          <div className="pokemon-name">
            {props.result.pokemons.map(x => translateSpeciesIfPossible(x.species, t)).join(', ')}
          </div>
        </div>
        <div className="button-area">
          <Button variant="outline-dark" size="sm">Show Detail</Button>
        </div>
      </div>    
    </>
  );
}