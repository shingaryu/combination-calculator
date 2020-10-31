import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Navbar, Container } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';
import { I18nextProvider } from 'react-i18next';
import ReactGA from 'react-ga';
import i18n from './i18n'

export const App: React.FunctionComponent = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const pathname = window.location.pathname;
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  });

  return (
    <Suspense fallback={<span>Loading translation data...</span>}>
      <I18nextProvider i18n={i18n}>
        <div className="App">
        <Navbar bg="light">
          {/* <Navbar.Brand className="nowrap-navbar">Pokémon VGC Team Performance Evaluator</Navbar.Brand> */}
          <Navbar.Brand className="nowrap-navbar" style={{fontSize: 18}}>ポケモン剣盾 パーティバランス計算機</Navbar.Brand>
        </Navbar>
        <Container fluid>
          <Suspense fallback={<span>Loading master data...</span>}>
            <TeamBuilderComponent></TeamBuilderComponent>
          </Suspense>
        </Container>
        </div>
      </I18nextProvider>
    </Suspense>
  );
}
