import React, { Component } from "react";
import { AuthService } from "../services/AuthService";

export default class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      message: ""
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = this.state;
    try {
      await AuthService.register({ username, email, password });
      this.setState({ message: "Registration successful! Please login." });
    } catch (err) {
      this.setState({ message: err.response?.data || "Registration failed" });
    }
  }

  render() {
    const { username, email, password, message } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={this.handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={this.handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={this.handleChange}
          required
        />
        <button type="submit">Register</button>
        {message && <div>{message}</div>}
      </form>
    );
  }
}