import React from 'react';
import { Modal, Button } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import PokemonStrategy from '../models/PokemonStrategy';
import { MMOPCalculator } from '../services/MMOPCalculator';
import { BattleTeamResultCard } from './battleTeamResultCard';
import { MMOPDetails } from './MMOPDetails';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import Matchup from '../models/Matchup';

type MMOPResultsProps = {
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
}

type MMOPResultsState = {
  modalShow: boolean,
  modalIndex: number,
  mmopDetailsProps: any
}

export class MMOPResults extends React.Component<MMOPResultsProps, MMOPResultsState> {
  constructor(props: MMOPResultsProps) {
    super(props);

    this.state = { 
      mmopDetailsProps: {},
      modalIndex: -1,
      modalShow: false
    };
  }

  static contextType = I18nContext;

  onMMOPDetailClick(index: number, result: BattleTeamSearchResult, matchups: Matchup[]) {
    const mmopDetailsProps: any = {
      index: index,
      result: result,
      myTeam: this.props.myTeam,
      oppTeam: this.props.oppTeam,
      matchups: matchups
    }
    this.setState({ modalIndex: index, modalShow: true, mmopDetailsProps: mmopDetailsProps});
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const mmopCalculator = new MMOPCalculator();
    
    const matchups = mmopCalculator.allMatchupValues(this.props.myTeam, this.props.oppTeam);
    const resultsMM = mmopCalculator.evaluate(this.props.myTeam, this.props.oppTeam);

    return (
    <>
      {resultsMM.map((result, index) => 
        <BattleTeamResultCard key={index} result={result} index={index + 1} onDetailClick={() => this.onMMOPDetailClick(index, result, matchups, )}/>
      )}

      <Modal size="lg" show={this.state.modalShow} onHide={() => this.setState({modalShow: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Details: {this.state.modalIndex + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MMOPDetails index={this.state.mmopDetailsProps.index} result={this.state.mmopDetailsProps.result} 
            myTeam={this.state.mmopDetailsProps.myTeam} oppTeam={this.state.mmopDetailsProps.oppTeam}
            matchups={this.state.mmopDetailsProps.matchups} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => this.setState({modalShow: false})}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )};
}
