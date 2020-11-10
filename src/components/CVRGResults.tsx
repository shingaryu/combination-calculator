import React from 'react';
import { Modal, Button } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import PokemonStrategy from '../models/PokemonStrategy';
import { CVRGCalculator } from '../services/CVRGCalculator';
import { BattleTeamResultCard } from './battleTeamResultCard';
import { CVRGDetails } from './CVRGDetails';
import Matchup from '../models/Matchup';
import { MyTeamResultWC } from '../models/ResultAc';

type CVRGResultsProps = {
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
}

type CVRGResultsState = {
  modalShow: boolean,
  modalIndex: number,
  cvrgDetailsProps: any
}

export class CVRGResults extends React.Component<CVRGResultsProps, CVRGResultsState> {
  constructor(props: CVRGResultsProps) {
    super(props);

    this.state = { 
      cvrgDetailsProps: {},
      modalIndex: -1,
      modalShow: false
    };
  }

  static contextType = I18nContext;

  onCVRGDetailClick(index: number, result: MyTeamResultWC, matchups: Matchup[]) {
    const cvrgDetailsProps: any = {
      index: index,
      result: result,
      myTeam: this.props.myTeam,
      oppTeam: this.props.oppTeam,
      matchups: matchups
    }
    this.setState({ modalIndex: index, modalShow: true, cvrgDetailsProps: cvrgDetailsProps});
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const cvrgCalculator = new CVRGCalculator();
    
    const matchups = cvrgCalculator.allMatchupValues(this.props.myTeam, this.props.oppTeam);
    const resultsWC = cvrgCalculator.evaluate(this.props.myTeam, this.props.oppTeam);

    return (
    <>
      {resultsWC.myTeamResults.map((result, index) => 
        <BattleTeamResultCard key={index} index={index + 1} value={result.evaluationValue} pokemonSet={result.myTeam} onDetailClick={() => this.onCVRGDetailClick(index, result, matchups)}/>
      )}

      <Modal size="lg" show={this.state.modalShow} onHide={() => this.setState({modalShow: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Details: {this.state.modalIndex + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CVRGDetails index={this.state.cvrgDetailsProps.index} result={this.state.cvrgDetailsProps.result} 
            myTeam={this.state.cvrgDetailsProps.myTeam} oppTeam={this.state.cvrgDetailsProps.oppTeam}
            matchups={this.state.cvrgDetailsProps.matchups} />
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
