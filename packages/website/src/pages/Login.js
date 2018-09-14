import React, { Component } from 'react'

export default class Login extends Component {
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
      case 'missing-credentials':
        return 'Please enter a username or password'

      case 'incorrect-credentials':
        return 'Incorrect username or password'

      case 'submit':
        return 'Could not submit form. Connection issues?'

      default:
        return 'An unknown error occurred. Please try again later'
    }
  }

  render () {
    const successRedirect = this.props.query.successRedirect || '/profile'
    const error = this.state.error
    const action = `/login?successRedirect=${successRedirect}`

    return (
      <form action={action} method='post' onSubmit={this.onSubmit}>
        <h2>Login</h2>

        {error && <p>{this.getErrorMessage(error)}</p>}

        <input type='text' name='username' placeholder='username' />
        <input type='password' name='password' placeholder='password' />
        <input type='submit' />

        <a href={`/forgot-password?validRedirect=${successRedirect}`}>
          Forgot your password?
        </a>
      </form>
    )
  }
}
