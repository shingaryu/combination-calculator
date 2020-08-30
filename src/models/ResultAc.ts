import PokemonStrategy from "./PokemonStrategy";
import TacticsPattern from "./TacticsPattern";
import Matchup from "./Matchup";

export type ResultAC = {
  myTeamResults: MyTeamResult[],
  strongestMyTeamIndex: number, 
  value: number
};

export type MyTeamResult = {
  myTeam: PokemonStrategy[],
  oppTeamResults: OppTeamResult[],
  strongestOppTeamIndex: number, 
  value: number
}

export type OppTeamResult = {
  oppTeam: PokemonStrategy[],
  tacticsResults: TacticsResult[],
  bestTacticsIndex: number, 
  value: number
}

export type TacticsResult = {
  tactics: TacticsPattern, 
  remainingHpSet: {player: PokemonStrategy, total: number}[], 
  remainingHpMinimumValue: number
  remainingHpMinumumPoke: PokemonStrategy 
}

export type ResultWC = {
  myTeamResults: MyTeamResultWC[],
  strongestMyTeamIndex: number,
  indivisualCoverage: number  
}

export type MyTeamResultWC = {
  myTeam: PokemonStrategy[],
  advantageousMatchups: { poke: PokemonStrategy, matchups: Matchup[] }[],
  maximumCoveragePokemonIndex: number,
  maximumCoverage: number,
  coverageNum: number,
  overallCoverage: number
}