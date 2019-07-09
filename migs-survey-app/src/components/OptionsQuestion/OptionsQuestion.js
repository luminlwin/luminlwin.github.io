import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import './OptionsQuestion.scss'
import { make2digit } from '../../helpers'

class OptionsQuestion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      questionText: "",
      questionNumber: "",
      options: [],
      answer: "Did not answer"
    }
  }

  submitAnswer = (question,answer) => {
    this.props.submit({
      question: question,
      answer: answer,
      validAnswer: true
    })
  }

  handleChange(event) {
    this.setState({
      answer: event.target.value
    })
    this.submitAnswer(
      (make2digit(this.state.questionNumber) + " - " + this.state.questionText),
      event.target.value
    )
  }
  
  componentWillMount() {
    this.setState({
      questionText: this.props.questionText,
      questionNumber: this.props.questionNumber,
      options: this.props.options
    })
    this.submitAnswer(
      (make2digit(this.props.questionNumber) + " - " + this.props.questionText),
      this.state.answer
    )
  }

  
  render() {
    const isLoading = !!(this.state.options.length > 0) ? false : true;

    const {questionText,questionNumber,options} = this.state;
    const {l10n} = this.props;

    return (isLoading
      ? <div></div>
      : <div className="OptionsQuestion">
          <p>{l10n("Question")} {l10n(questionNumber)} - {l10n(questionText)}</p>
          
          <select value={this.state.answer} onChange={this.handleChange.bind(this)}>
            {options.map(o => {
              return <option key={o} value={o}>{l10n(o)}</option>  
            })}
          </select>
          <br />
          <hr/>
        </div>

        
    );
  }
}

OptionsQuestion.propTypes = {}

OptionsQuestion.defaultProps = {}

export default OptionsQuestion
