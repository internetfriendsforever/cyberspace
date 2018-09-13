import React, { Component } from 'react'

export default class CheckToken extends Component {
  getErrorMessage (code) {
    switch (code) {
      case 'expired':
        return 'The link has expired'

      default:
        return 'An unknown error occurred. Please try again later'
    }
  }

  render () {
    const { success, error } = this.props.query

    if (success) {
      return (
        <h2>You are now logged in</h2>
      )
    } else if (error) {
      return (
        <p>{this.getErrorMessage(error)}</p>
      )
    }

    return null
  }
}
