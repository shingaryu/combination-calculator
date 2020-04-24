import React from 'react';
// import './App.css';
import { Navbar } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';

function App() {
  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>Pokémon VGC Team Combination Calculator</Navbar.Brand>
      </Navbar>
      <TeamBuilderComponent></TeamBuilderComponent>
    </div>
  );
}

export default App;
