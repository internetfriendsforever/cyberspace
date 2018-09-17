import React, { Component } from 'react'

export default class ChangePassword extends Component {
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
      case 'missing-password':
        return 'Passwords are required'

      case 'incorrect-password':
        return 'Incorrect old password'

      default:
        return 'An unknown error occurred. Please try again later'
    }
  }

  render () {
    const authentication = this.props.authentication
    const success = this.props.query.success
    const error = this.state.error

    if (success) {
      return (
        <h2>Your password has been changed!</h2>
      )
    }

    return (
      <form action='/change-password' method='post' onSubmit={this.onSubmit}>
        <h2>Change password</h2>

        {error && <p>{this.getErrorMessage(error)}</p>}

        {authentication !== 'email' && (
          <input type='password' name='oldPassword' placeholder='Old password' />
        )}

        <input type='password' name='newPassword' placeholder='New password' />

        <input type='submit' />
      </form>
    )
  }
}
