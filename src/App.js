import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Navbar, Container } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';
import { I18nextProvider } from 'react-i18next';
import ReactGA from 'react-ga';
import i18n from './i18n'

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const pathname = window.location.pathname;
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  });

  return (
    <Suspense fallback={null}>
      <I18nextProvider i18n={i18n}>
        <div className="App">
        <Container fluid>
          <Navbar bg="light">
            <Navbar.Brand className="nowrap-navbar">Pokémon VGC Team Performance Evaluator</Navbar.Brand>
          </Navbar>
          <TeamBuilderComponent></TeamBuilderComponent>
        </Container>
        </div>
      </I18nextProvider>
    </Suspense>
  );
}

export default App;
