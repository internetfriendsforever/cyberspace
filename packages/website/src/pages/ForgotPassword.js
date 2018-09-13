import React, { Component } from 'react'

export default class ForgotPassword extends Component {
  state = {
    error: this.props.query.error
  }

  componentDidUpdate (prevProps) {
    if (prevProps.query.error !== this.props.query.error) {
      this.setState({ error: this.props.query.error })
    }
  }

  onSubmit = e => {
    e.preventDefault()

    const navigate = this.props.navigate
    const form = e.currentTarget
    const data = new window.FormData(form)
    const keys = Array.from(data.keys())
    const pairs = keys.map(key => [key, data.get(key)])

    navigate(form.action, { replace: true })

    window.fetch(form.action, {
      method: form.method,
      body: new URLSearchParams(pairs)
    }).then(res => {
      navigate(res.url, { replace: true })
    }).catch(() => {
      this.setState({ error: 'submit' })
    })
  }

  getErrorMessage (code) {
    switch (code) {
      case 'missing-user':
        return 'Please enter a username'

      case 'no-user':
        return 'Could not find user'

      case 'submit':
        return 'Could not submit form. Connection issues?'

      default:
        return 'An unknown error occurred. Please try again later'
    }
  }

  render () {
    const success = this.props.query.success
    const error = this.state.error

    if (success) {
      return (
        <h2>An email has been sent with further instructions</h2>
      )
    }

    return (
      <form action='/forgot-password' method='post' onSubmit={this.onSubmit}>
        <h2>Forgot password</h2>
        {error && <p>{this.getErrorMessage(error)}</p>}
        <input type='text' name='username' placeholder='username' />
        <input type='submit' />
      </form>
    )
  }
}
