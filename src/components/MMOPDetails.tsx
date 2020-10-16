import React from 'react';
import { Table } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
// import './MMOPDetails.css'
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import Matchup from '../models/Matchup';

type MMOPDetailsProps = {
  index: number,
  result: BattleTeamSearchResult,
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
  matchups: Matchup[]
}

export const MMOPDetails: React.FunctionComponent<MMOPDetailsProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <Table striped bordered hover size="sm">                
        <thead>
          <tr>
            <th> </th>
            {props.oppTeam.map((x, i) => 
              <th key={`h-${i+1}`}>
                {translateSpeciesIfPossible(x.species, t)}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {props.myTeam.map((my, i) => 
            <tr key={`r-${i}`}>
              <td key={`r-${i}-d-0`}>
                {translateSpeciesIfPossible(my.species, t)}
              </td>
              {props.oppTeam.map((opp, i) => 
                <td key={`r-${i}-d-${i+1}`}>
                  {props.matchups.find(z => z.player.id === my.id && z.opponent.id === opp.id)?.value.toFixed(0)}
                </td>
              )}
            </tr>
          )}            
        </tbody>
      </Table> 
    </>
  );
}