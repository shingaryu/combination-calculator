import React from 'react';
import { Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import './battleTeamResultCard.css'
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';

type BattleTeamResultCardProps = {
  index: number,
  value: number,
  pokemonSet: PokemonStrategy[],
  onDetailClick: () => void
}

export const BattleTeamResultCard: React.FunctionComponent<BattleTeamResultCardProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="result-card">
        <div className="text-area">
          <div>
            <span>{props.index}. {t('battleTeam.evaluation')}: </span>
            <span className={props.value < 0? "value-text color-blue": "value-text color-red"}>
              {props.value.toFixed(0)}
            </span> 
          </div>
          <div className="pokemon-name">
            {props.pokemonSet.map(x => translateSpeciesIfPossible(x.species, t)).join(', ')}
          </div>
        </div>
        <div className="button-area">
          <Button variant="outline-dark" size="sm" onClick={() => props.onDetailClick()}>{t('battleTeam.detail')}</Button>
        </div>
      </div>    
    </>
  );
}