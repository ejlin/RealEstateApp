import './App.css';
import SignUp from './components/SignUp.js';
import Login from './components/Login.js';
import MainDashboard from './components/MainDashboard.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (

    <Router>
      <div>
        <Link to="/signup">
          Sign Up
        </Link>
        <Link to="/login">
          Login
        </Link>
        <Switch>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/dashboard" render={(props) => <MainDashboard {...props}/>}/>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
