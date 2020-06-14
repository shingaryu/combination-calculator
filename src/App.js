import React, { Suspense } from 'react';
import './App.css';
import { Navbar, Container } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'

function App() {
  return (
    <Suspense fallback={null}>
      <I18nextProvider i18n={i18n}>
        <div className="App">
        <Container fluid>
          <Navbar bg="light">
            <Navbar.Brand className="nowrap-navbar">Pokémon VGC Team Combination Calculator</Navbar.Brand>
          </Navbar>
          <TeamBuilderComponent></TeamBuilderComponent>
        </Container>
        </div>
      </I18nextProvider>
    </Suspense>
  );
}

export default App;
