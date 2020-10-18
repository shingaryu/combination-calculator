import React from 'react';
import { Modal, Button } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import PokemonStrategy from '../models/PokemonStrategy';
import { MAOPCalculator } from '../services/MAOPCalculator';
import { BattleTeamResultCard } from './battleTeamResultCard';
import { MAOPDetails } from './MAOPDetails';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import Matchup from '../models/Matchup';

type MAOPResultsProps = {
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
}

type MAOPResultsState = {
  modalShow: boolean,
  modalIndex: number,
  maopDetailsProps: any
}

export class MAOPResults extends React.Component<MAOPResultsProps, MAOPResultsState> {
  constructor(props: MAOPResultsProps) {
    super(props);

    this.state = { 
      maopDetailsProps: {},
      modalIndex: -1,
      modalShow: false
    };
  }

  static contextType = I18nContext;

  onMAOPDetailClick(index: number, result: BattleTeamSearchResult, matchups: Matchup[]) {
    const maopDetailsProps: any = {
      index: index,
      result: result,
      myTeam: this.props.myTeam,
      oppTeam: this.props.oppTeam,
      matchups: matchups
    }
    this.setState({ modalIndex: index, modalShow: true, maopDetailsProps: maopDetailsProps});
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const maopCalculator = new MAOPCalculator();
    
    const matchups = maopCalculator.allMatchupValues(this.props.myTeam, this.props.oppTeam);
    const resultsMA = maopCalculator.evaluate(this.props.myTeam, this.props.oppTeam);

    return (
    <>
      {resultsMA.map((result, index) => 
        <BattleTeamResultCard key={index} result={result} index={index + 1} onDetailClick={() => this.onMAOPDetailClick(index, result, matchups, )}/>
      )}

      <Modal size="lg" show={this.state.modalShow} onHide={() => this.setState({modalShow: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Details: {this.state.modalIndex + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MAOPDetails index={this.state.maopDetailsProps.index} result={this.state.maopDetailsProps.result} 
            myTeam={this.state.maopDetailsProps.myTeam} oppTeam={this.state.maopDetailsProps.oppTeam}
            matchups={this.state.maopDetailsProps.matchups} />
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
