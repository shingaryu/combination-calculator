import React from 'react';
import { Table } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import './CVRGDetails.css'
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import Matchup from '../models/Matchup';
import { MyTeamResultWC } from '../models/ResultAc';

type CVRGDetailsProps = {
  index: number,
  result: MyTeamResultWC,
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
  matchups: Matchup[]
}

export const CVRGDetails: React.FunctionComponent<CVRGDetailsProps> = (props) => {
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
              <td key={`r-${i}-d-0`} className={props.result.myTeam.some(p => p.id === my.id)?"":"color-lightgray"}>
                {translateSpeciesIfPossible(my.species, t)}
              </td>
              {props.oppTeam.map((opp, i) => {
                const isMyPokeInResult = props.result.myTeam.some(p => p.id === my.id);
                const matchup = props.matchups.find(z => z.player.id === my.id && z.opponent.id === opp.id);
                const isAdvantegous = props.result.advantageousMatchups.some(a => a.matchups.some(m => 
                  m.player.id === my.id && m.opponent.id === opp.id));

                if (!matchup) {
                  return <td> </td>
                }

                return (
                  <td key={`r-${i}-d-${i+1}`} className={
                    (isMyPokeInResult?" ":"color-lightgray") + (matchup.value<0?"color-blue":"color-red") + (isAdvantegous? " in-tactics": "")}>
                    {matchup.value.toFixed(0)}
                  </td>                
                );
              }
              )}
            </tr>
          )}            
        </tbody>
      </Table>
      <div>
        <span>Maximum Coverage: </span>
          <span>{translateSpeciesIfPossible(props.result.myTeam[props.result.maximumCoveragePokemonIndex].species, t)} </span>
          <span>{props.result.maximumCoverage}</span>
      </div>
      <div>Overall Coverage: {props.result.overallCoverage.toFixed(3)}</div>
      <div>Num. of Coverage: {props.result.coverageNum}</div>
    </>
  );
}