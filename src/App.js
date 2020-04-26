import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
// import './App.css';
import { Navbar } from 'react-bootstrap';
import { TeamBuilderComponent } from './components/teamBuilderComponent';

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const pathname = window.location.pathname;
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  });

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
