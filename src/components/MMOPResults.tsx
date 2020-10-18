// import React from 'react';
// import { Container, Row, Col, Table, Tabs, Tab, Modal, Button } from 'react-bootstrap'
// import { I18nContext } from 'react-i18next';
// import { translateSpeciesIfPossible } from '../services/stringSanitizer';
// import PokemonStrategy from '../models/PokemonStrategy';
// import { CombinationService } from '../services/combination-service';
// import { defaultTeam } from '../defaultList';
// import { MMOPCalculator } from '../services/MMOPCalculator';
// import { BattleTeamResultCard } from './battleTeamResultCard';
// import { MMOPDetails } from './MMOPDetails';
// import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
// import Matchup from '../models/Matchup';

// type MMOPResultsProps = {
//   // sortedPokemonList: PokemonStrategy[],
//   // combinationService: CombinationService,
//   myTeam: PokemonStrategy[],
//   oppTeam: PokemonStrategy[],
// }

// type MMOPResultsState = {
//   mmopModalShow: boolean,
//   mmopModalIndex: number,
//   mmopDetailsProps: any
// }

// export class MMOPResults extends React.Component<MMOPResultsProps, MMOPResultsState> {
//   constructor(props: MMOPResultsProps) {
//     super(props);

//     const pokeList = this.props.sortedPokemonList;

//     this.state = { 
//       myTeam: defaultTeam(pokeList),
//       oppTeam: defaultTeam(pokeList),
//       mmopDetailsProps: {},
//       mmopModalIndex: -1,
//       mmopModalShow: false
//     };
//   }

//   static contextType = I18nContext;
//   // declare context: React.ContextType<typeof I18nContext>

//   onChangeMyPokemons(pokemons: PokemonStrategy[]) {
//     this.setState({ myTeam: pokemons });
//   }

//   onChangeOppPokemons(pokemons: PokemonStrategy[]) {
//     this.setState({ oppTeam: pokemons });
//   }

//   onMMOPDetailClick(index: number, result: BattleTeamSearchResult, matchups: Matchup[]) {
//     const mmopDetailsProps: any = {
//       index: index,
//       result: result,
//       myTeam: this.state.myTeam,
//       oppTeam: this.state.oppTeam,
//       matchups: matchups
//     }
//     this.setState({ mmopModalIndex: index, mmopModalShow: true, mmopDetailsProps: mmopDetailsProps});
//   }

//   render() {
//     const t = this.context.i18n.t.bind(this.context.i18n);

//     const mmopCalculator = new MMOPCalculator(this.props.combinationService);
    
//     const matchups = mmopCalculator.allMatchupValues(this.state.myTeam, this.state.oppTeam);
//     const resultsMM = mmopCalculator.evaluate(this.state.myTeam, this.state.oppTeam);

//     return (
//     <>
//       {resultsMM.map((result, index) => 
//         <BattleTeamResultCard result={result} index={index + 1} onDetailClick={() => this.onMMOPDetailClick(index, result, matchups, )}/>
//       )}

//       <Modal size="lg" show={this.state.mmopModalShow} onHide={() => this.setState({mmopModalShow: false})}>
//         <Modal.Header closeButton>
//           <Modal.Title>Details: {this.state.mmopModalIndex + 1}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <MMOPDetails index={this.state.mmopDetailsProps.index} result={this.state.mmopDetailsProps.result} 
//             myTeam={this.state.mmopDetailsProps.myTeam} oppTeam={this.state.mmopDetailsProps.oppTeam}
//             matchups={this.state.mmopDetailsProps.matchups} />
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={() => this.setState({mmopModalShow: false})}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   )};
// }
