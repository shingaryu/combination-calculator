import React, { Suspense } from 'react';
// import './App.css';
import { Navbar } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'

function App() {
  return (
    <Suspense fallback={null}>
      <I18nextProvider i18n={i18n}>
        <div className="App">
          <Navbar bg="light">
            <Navbar.Brand>Pokémon VGC Team Combination Calculator</Navbar.Brand>
          </Navbar>
          <TeamBuilderComponent></TeamBuilderComponent>
        </div>
      </I18nextProvider>
    </Suspense>
  );
}

export default App;
