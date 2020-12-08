import './App.css';
import SignUp from './components/SignUp.js';
import Login from './components/Login.js';
import MainDashboard from './components/MainDashboard.js';
import PropertiesDashboard from './components/PropertiesDashboard.js';
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
        {/* <Link to="/signup">
          Sign Up
        </Link>
        <Link to="/login">
          Login
        </Link> */}
        <Switch>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/addproperty" render={(props) => <NewPropertyForm {...props}/>}/>
          <Route path="/dashboard" render={(props) => <MainDashboard {...props}/>}/>
          <Route path="/properties" render={(props) => <PropertiesDashboard {...props}/>}/>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
