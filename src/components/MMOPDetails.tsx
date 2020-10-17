import React from 'react';
import { Table } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import './MMOPDetails.css'
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
              <th key={`h-${i+1}`} className="font-initial">
                {translateSpeciesIfPossible(x.species, t)}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {props.myTeam.map((my, i) => 
            <tr key={`r-${i}`}>
              <td key={`r-${i}-d-0`} className={props.result.pokemons.some(p => p.id === my.id)?"":"color-lightgray"}>
                {translateSpeciesIfPossible(my.species, t)}
              </td>
              {props.oppTeam.map((opp, i) => {
                const isMyPokeInResult = props.result.pokemons.some(p => p.id === my.id);
                const matchup = props.matchups.find(z => z.player.id === my.id && z.opponent.id === opp.id);
                const isInTactics = props.result.tacticsPattern?.matchups.some(z => z.player.id === my.id && z.opponent.id === opp.id);

                if (!matchup) {
                  return <td> </td>
                }

                return (
                  <td key={`r-${i}-d-${i+1}`} className={(isMyPokeInResult?" ":"color-lightgray") + (isInTactics?"in-tactics ":" ") + (matchup.value<0?"color-blue":"color-red")}>
                    {matchup.value.toFixed(0)}
                  </td>                
                );
              }
              )}
            </tr>
          )}            
        </tbody>
      </Table>
      <div>Overused</div>
      {props.result.overused?.map((info: any, index: number) => {
        const fromPokemon = info.player;
        const valueInt = Math.round(info.total);
        return (
          <div key={`ou-${index}`}>{`${translateSpeciesIfPossible(fromPokemon.species, t)}: ${valueInt}`}</div>
        );
      })}
    </>
  );
}