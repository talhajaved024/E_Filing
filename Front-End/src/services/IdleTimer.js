import React, { Component } from 'react';
import { AuthService } from './AuthService';

class IdleTimer extends Component {
  constructor(props) {
    super(props);
    this.timeout = null;
    this.idleTime = 10 * 60 * 1000; // 10 minutes
    this.events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
  }

  componentDidMount() {
    this.resetTimer();
    this.events.forEach((event) => window.addEventListener(event, this.resetTimer));
  }

  componentWillUnmount() {
    this.events.forEach((event) => window.removeEventListener(event, this.resetTimer));
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.timeout) clearTimeout(this.timeout);
  };

  resetTimer = () => {
    this.clearTimer();
    this.timeout = setTimeout(this.handleIdle, this.idleTime);
  };

  handleIdle = () => {
    console.log('User inactive for 10 minutes. Logging out...');
    
    try {
      // Call the parent's onIdle callback if provided
      if (this.props.onIdle) {
        this.props.onIdle();
      } else {
        AuthService.logout(false);
      }
    } catch (error) {
      console.error('Error logging out due to inactivity:', error);
    }
  };

  render() {
    return null;
  }
}

export default IdleTimer;