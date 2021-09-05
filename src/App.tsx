import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import TeamBuilderComponent from './components/teamBuilderComponent';
import { I18nextProvider } from 'react-i18next';
import ReactGA from 'react-ga';
import i18n from './i18n'
import { Provider } from "react-redux";
import store from "./redux/store";

export const App: React.FunctionComponent = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const pathname = window.location.pathname;
      ReactGA.set({ page: pathname });
      ReactGA.pageview(pathname);
    }
  });

  return (
    <Provider store={store}>
      <Suspense fallback={<span>Loading translation data...</span>}>
        <I18nextProvider i18n={i18n}>
          <div className="App">
          <Navbar bg="light">
            {/* <Navbar.Brand className="nowrap-navbar">Pokémon VGC Team Performance Evaluator</Navbar.Brand> */}
            <Navbar.Brand className="nowrap-navbar" style={{fontSize: 18}}>ポケモン剣盾 パーティバランス計算機</Navbar.Brand>
          </Navbar>
          {/* <Navbar bg="light">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
              </NavDropdown>
            </Nav>        
          </Navbar>         */}
          <Container fluid>
            <Suspense fallback={<span>Loading master data...</span>}>
              <TeamBuilderComponent></TeamBuilderComponent>
            </Suspense>
          </Container>
          </div>
        </I18nextProvider>
      </Suspense>
    </Provider>
  );
}
