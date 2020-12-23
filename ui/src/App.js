import './App.css';
import HomePage from './components/HomePage.js';
import PricingPage from './components/PricingPage.js';
import SignUpPage from './components/SignUpPage.js';
import Login from './components/Login.js';
import MainDashboard from './components/MainDashboard.js';
import PropertiesDashboard from './components/PropertiesDashboard.js';
import AnalysisDashboard from './components/AnalysisDashboard.js';
import FilesDashboard from './components/FilesDashboard.js';
import ExploreDashboard from './components/ExploreDashboard.js';
import SettingsDashboard from './components/SettingsDashboard.js';

import NewPropertyForm from './components/NewPropertyForm.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './components/CSS/Style.css';

function App() {
  return (

    <Router>
      <div>
        <Switch>
          <Route path="/signup">
            <SignUpPage />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/pricing">
            <PricingPage/>
          </Route>
          <Route path="/addproperty" render={(props) => <NewPropertyForm {...props}/>}/>
          <Route path="/dashboard" render={(props) => <MainDashboard {...props}/>}/>
          <Route path="/properties" render={(props) => <PropertiesDashboard {...props}/>}/>
          <Route path="/analysis" render={(props) => <AnalysisDashboard {...props}/>}/>
          <Route path="/files" render={(props) => <FilesDashboard {...props}/>}/>
          <Route path="/explore" render={(props) => <ExploreDashboard {...props}/>}/>
          <Route path="/settings" render={(props) => <SettingsDashboard {...props}/>}/>
          <Route path="/">
            <HomePage/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
