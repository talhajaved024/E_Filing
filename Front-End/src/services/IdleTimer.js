import React, { Component } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilClock } from '@coreui/icons';
import { AuthService } from './AuthService';

// Total idle budget is WARNING_AFTER_MS + COUNTDOWN_SECONDS (3 min + 2 min = 5 min).
const WARNING_AFTER_MS = 3 * 60 * 1000;
const COUNTDOWN_SECONDS = 2 * 60;

class IdleTimer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showWarning: false,
      secondsLeft: COUNTDOWN_SECONDS,
    };
    this.warningTimeout = null;
    this.countdownInterval = null;
    this.events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
  }

  componentDidMount() {
    this.startWarningTimer();
    this.events.forEach((event) => window.addEventListener(event, this.handleActivity));
  }

  componentWillUnmount() {
    this.events.forEach((event) => window.removeEventListener(event, this.handleActivity));
    this.clearTimers();
  }

  clearTimers = () => {
    if (this.warningTimeout) clearTimeout(this.warningTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.warningTimeout = null;
    this.countdownInterval = null;
  };

  startWarningTimer = () => {
    if (this.warningTimeout) clearTimeout(this.warningTimeout);
    this.warningTimeout = setTimeout(this.showWarning, WARNING_AFTER_MS);
  };

  // While the warning popup is visible, activity no longer silently resets the
  // timer — the user must explicitly pick "Keep Session" or "Logout Now".
  handleActivity = () => {
    if (this.state.showWarning) return;
    this.startWarningTimer();
  };

  showWarning = () => {
    this.setState({ showWarning: true, secondsLeft: COUNTDOWN_SECONDS });
    if (this.props.onVisibilityChange) this.props.onVisibilityChange(true);

    this.countdownInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.secondsLeft <= 1) {
          this.handleLogout();
          return { secondsLeft: 0 };
        }
        return { secondsLeft: prevState.secondsLeft - 1 };
      });
    }, 1000);
  };

  handleKeepSession = () => {
    this.clearTimers();
    this.setState({ showWarning: false, secondsLeft: COUNTDOWN_SECONDS });
    if (this.props.onVisibilityChange) this.props.onVisibilityChange(false);
    this.startWarningTimer();
  };

  handleLogout = () => {
    this.clearTimers();
    this.setState({ showWarning: false });
    if (this.props.onVisibilityChange) this.props.onVisibilityChange(false);

    try {
      if (this.props.onIdle) {
        this.props.onIdle();
      } else {
        AuthService.logout();
      }
    } catch (error) {
      console.error('Error logging out due to inactivity:', error);
    }
  };

  formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  render() {
    const { showWarning, secondsLeft } = this.state;

    return (
      <CModal
        visible={showWarning}
        backdrop="static"
        keyboard={false}
        alignment="center"
        onClose={() => {}}
      >
        <CModalHeader closeButton={false}>
          <CModalTitle>
            <CIcon icon={cilClock} className="me-2 text-warning" />
            Session About to Expire
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          <p className="mb-2">You've been inactive for a while.</p>
          <p className="mb-0">For your security, you'll be logged out in</p>
          <div className="display-4 fw-bold text-danger my-3">
            {this.formatTime(secondsLeft)}
          </div>
          <p className="text-medium-emphasis mb-0">
            Choose "Keep Session" to stay signed in, or "Logout Now" to end your session.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" variant="outline" onClick={this.handleLogout}>
            Logout Now
          </CButton>
          <CButton color="primary" onClick={this.handleKeepSession}>
            Keep Session
          </CButton>
        </CModalFooter>
      </CModal>
    );
  }
}

export default IdleTimer;
