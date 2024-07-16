// Import necessary dependencies from React and React Router
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/components/shared/AuthProvider';
import Login from './components/Login/Login';
import Modal from 'react-modal';
import LoadingSpinner from './components/shared/LoadingSpinner';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import PgSelection from './components/PgSelection/PgSelection';
import Dashboard from './components/Dashboard/Dashboard';

// Set the root element for the Modal component
Modal.setAppElement('#root');

// PrivateRoute component - restricts access to authenticated users
const PrivateRoute = ({ component: Component, ...rest }) => {
  const authContext = useAuth();
  const userEmail = authContext.currentUser ? authContext.currentUser.email : null;

  if (authContext.loading) {
    return <LoadingSpinner />;
  }

  // Check if user email matches the specific email ID
  if (userEmail === 'sudarshankapatil@gmail.com') {
    return <Route {...rest} render={(props) => <AdminDashboard {...props} />} />;
  }

  // For other users, redirect to the PgSelection page
  return (
    <Route
      {...rest}
      render={(props) =>
        authContext.currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};

// PublicRoute component - controls access to routes based on user authentication
const PublicRoute = ({ component: Component, restricted, ...rest }) => {
  const authContext = useAuth();
  if (authContext.loading) {
    return <LoadingSpinner />;
  }
  return (
    <Route
      {...rest}
      render={(props) =>
        authContext.currentUser && restricted ? (
          <Redirect to="/pg-selection" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <PublicRoute path="/login" restricted component={Login} />
          <PrivateRoute path="/pg-selection" component={PgSelection} />
          <PrivateRoute
            path="/dashboard/:pgId"
            component={({ match, ...props }) => {
              const { pgId } = match.params;
              return pgId && pgId !== "undefined" ? (
                <Dashboard {...props} pgId={pgId} />
              ) : (
                <Redirect to="/pg-selection" />
              );
            }}
          />
          <Redirect from="/" to="/login" />
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
