import React, { Component } from 'react';
import Select from 'react-select';
import './App.css';
import { l10nMain, replaceMMNumbers } from './localization';
import BarchartQuestion from './components/BarchartQuestion/BarchartQuestion';
import FreeTextQuestion from './components/FreeTextQuestion/FreeTextQuestion';
import OptionsQuestion from './components/OptionsQuestion/OptionsQuestion';
import firebase from './Firebase';
import * as moment from 'moment';
import Countdown from 'react-countdown-now';
import { CSVLink, CSVDownload } from "react-csv";


class App extends Component {

  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection('survey_submissions');
    this.unsubscribe = null;
    this.state = {
      dimensions: {
				height: window.innerHeight, 
				width: window.innerWidth
      },
      questionWidthScaleFactor: 0.9,
      selectedLanguage: {
        label:"English",
        value:"en"
      },
      answers: {},
      _startTime: '',
      answering: false,
      exportData: [],
      firstLoad: true
    }
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'mm', label: 'မြန်မာ' }
  ]

  componentDidMount() { 
    window.addEventListener("resize", this.updateDimensions);
    // let currentData = [];
    this.getDataForExport();
  }  
  
  getDataForExport = () => {
    // let exportPromises;
    let exportData = [];
    this.ref.onSnapshot(d => {
      // console.log(d);
      Promise
        .all(d.docs.map(doc => doc.data()))
        .then(result => {
          this.setState({
            exportData: result
          })
        })
    });

    
    return exportData;
  }

  afterCoolDown = () => {
    // if (this.state.firstLoad) this.setState({firstLoad: false});
    return <button 
        className="submitButton"
        disabled={!this.isButtonDisabled()}
        onClick={this.startQuestionnare.bind(this)}
      >{this.l10n("Start Questionnaire")}</button>
  }

  renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return this.afterCoolDown();
    } else {
      // Render a countdown
      return <div>
          {this.l10n("Thank you!")} <br/>
          {replaceMMNumbers(seconds)} {this.l10n("seconds")}
        </div>;
    }
  };

  l10n = (s) => l10nMain(s, this.state.selectedLanguage.value);

  submitAnswer = (a) => {
    let answers = this.state.answers;
    const answerMMNumReplaced = typeof(a.answer) === 'string' ? replaceMMNumbers(a.answer) : a.answer;
    answers[a.question] = {answer: answerMMNumReplaced, validAnswer: a.validAnswer};;
    this.setState({
      answers: answers
    })
    console.log(answers);
    this.getDataForExport();
  }

  calcQuestionWidth() {
    const maxWidth = this.state.dimensions.width
      * this.state.questionWidthScaleFactor
      - 20;
    return Math.min(500,maxWidth);
  }

  updateDimensions() {
    this.setState({
      dimensions: {
				height: window.innerHeight, 
				width: window.innerWidth
			}
    });
  }

  handleLanguageChange = (selectedOption) => {
    this.setState({ selectedLanguage: selectedOption });
  }

  isButtonDisabled = () => {
    return Object.values(this.state.answers)
      .map(d => d.validAnswer)
      .reduce((isStillTrue, next) => isStillTrue && next,true);
  }

  getAnswersOnly = (answers) => {
    const questions = Object.keys(answers);
    let newAnswers = {};
    questions.forEach(q => {
      if (typeof(answers[q].answer) === 'object') {
        answers[q].answer.forEach(d => {
          newAnswers[q+"~"+d.optionText] = d.points.toString();
        })
      } else {
        newAnswers[q] = answers[q].answer.toString();
      }
    });
    return newAnswers;
  }

  submitQuestionnare = () => {
    this.ref.add({
      ...this.getAnswersOnly(this.state.answers),
      _startTime: this.state._startTime.format(),
      _submitTime: moment().format()
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
    this.setState({
      answering: false
    })
  }

  startQuestionnare = () => {
    this.setState({
      _startTime: moment(),
      answering: true,
      firstLoad: false
    });
  }

  

  render() {

    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <p>
            MIGS Survey App Prototype
          </p>
        </header>
        <div className="App-body">

        <label className='pickerWrapper'>
          မြန်မာ/English:
          <Select
            value={this.state.selectedLanguage}
            onChange={this.handleLanguageChange}
            options={this.languageOptions}
            className='picker'
          />
        </label>

        <br/>
          {
            this.state.answering
            ? <div>
              {this.l10n("This survey started at")} {this.state._startTime.format("DD MMM YYYY hh:mm:ss A")}
              <hr/>

              <BarchartQuestion
                questionNumber={1}
                questionText="Allocate the union budget across the following ministries"
                options={[
                  {id:1,optionText:"Electric and Energy",points:28,type:"percent"},
                  {id:2,optionText:"Defence",points:16,type:"percent"},
                  {id:3,optionText:"Education",points:9,type:"percent"},
                  {id:4,optionText:"Agriculture, Livestock and Irrigation",points:8,type:"percent"},
                  {id:5,optionText:"Health and Sports",points:5,type:"percent"},
                  {id:6,optionText:"Home Affairs",points:4,type:"percent"}
                ]}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              {/* <BarchartQuestion
                questionNumber={2}
                questionText="Allocate the Kayin regional government budget across the following ministries"
                options={[
                  {id:1,optionText:"Construction",points:55,type:"percent"},
                  {id:2,optionText:"Electricity",points:13,type:"percent"},
                  {id:3,optionText:"State Government Bodies",points:12,type:"percent"},
                  {id:4,optionText:"Home Affairs",points:8,type:"percent"},
                  {id:5,optionText:"Municipal-DAOs",points:6,type:"percent"},
                  {id:6,optionText:"Agriculture, Livestock and Irrigation",points:3,type:"percent"}
                ]}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              /> */}

              <BarchartQuestion
                questionNumber={2}
                questionText="Allocate the budget between Union and Region/State level governments"
                options={[
                  {id:1,optionText:"Union",points:92,type:"percent"},
                  {id:2,optionText:"Region/State",points:8,type:"percent"}
                ]}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <FreeTextQuestion
                questionNumber={3}
                questionText="Ward/Village code number"
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <FreeTextQuestion
                questionNumber={4}
                questionText="What is your age?"
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={5}
                questionText="What is your Sex?"
                options={[
                  "Male",
                  "Female",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={6}
                questionText="What is your Relationship to the Head of Household?"
                options={[
                  "Head",
                  "Wife/Husband",
                  "Daughter/Son",
                  "Elder or Younger Sister/Elder or Younger Brother",
                  "Daughter-in-law/Son-in-law",
                  "Sister-in-law/Brother-in-law",
                  "Grandchild",
                  "Parent",
                  "Parent-in-law",
                  "Other relative",
                  "Adopted/foster/step child",
                  "Not related",
                  "Don’t know",
                  "Did not answer",
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={7}
                questionText="What is your Marital Status?"
                options={[
                  "Married or living together",
                  "Divorced/separated",
                  "Widowed",
                  "Never married and never lived together",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <FreeTextQuestion
                questionNumber={8}
                questionText="What is your ethnicity?"
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={9}
                questionText="What is your religion?"
                options={[
                  "Buddhist",
                  "Christian",
                  "Muslim",
                  "Hindu",
                  "Animist",
                  "Other religion",
                  "No religion",
                  "Did not answer"
                ]}
                allowOther={true}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={10}
                questionText="What is the highest level of education you have completed?"
                options={[
                  "Less than 1st standard",
                  "1st standard",
                  "2nd standard",
                  "3rd standard",
                  "4th standard",
                  "5th standard",
                  "6th standard",
                  "7th standard",
                  "8th standard",
                  "9th standard",
                  "10th standard",
                  "Bachelor’s degree",
                  "Postgraduate degree",
                  "Vocational qualification",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={11}
                questionText="What was your activity status during the last 12 months?"
                options={[
                  "1 - employee (government)",
                  "2 - employee (private, org)",
                  "3 - employer",
                  "4 - own account worker",
                  "5 - contributing family worker",
                  "6 - sought work",
                  "7 - did not seek work",
                  "8 - full-time student",
                  "9 - household work",
                  "10 - pensioner, retired, elderly person",
                  "11 - ill, disabled",
                  "12 - other",
                  "Did not answer"
                ]}
                allowOther={true}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <FreeTextQuestion
                questionNumber={12}
                questionText="(For those that responded with 1-5 or 12 to Q11), What work were you mainly doing in the last 12 months?"
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={13}
                questionText="Do you own a mobile telephone?"
                options={[
                  "Yes",
                  "No",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={14}
                questionText="Does anyone else in your household own a mobile telephone?"
                options={[
                  "Yes",
                  "No",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <FreeTextQuestion
                questionNumber={15}
                questionText="How many people live in this household in total?"
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={16}
                questionText="What is the highest education level that the female household head or spouse of household head has completed?"
                options={[
                  "No female head/spouse",
                  "No education/kindergarten/first standard",
                  "Second standard",
                  "Third to fifth standard",
                  "Sixth standard or higher",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={17}
                questionText="How many rooms does the household occupy, including bedrooms, living rooms, and rooms used for household businesses (do not count toilets, kitchens, balconies, or corridors)?"
                options={[
                  "One or none",
                  "Two",
                  "Three",
                  "Four",
                  "Five or more",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={18}
                questionText="What type of stove is used most often for cooking food in the household?"
                options={[
                  "Open fire, open stove, rice-hush stove or traditional closed stove",
                  "Improved stove, stove with electricity, gas, kerosene/diesel or biofuel",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={19}
                questionText="Does any household member own or have access to a bicycle or non-motorized boat, a motorcycle, power tiller, trishaw, motorboat, trawlarjee, three-wheeled motor vehicle, motorcar (4 wheels or more), or tractor (including one rented to others or pawned)?"
                options={[
                  "None of these",
                  "Only bicylce or non-motorized boat",
                  "Motorcycle, power tiller, thrishaw, motroboat, trawlarjee, three-wheeld motor vehicle, motorcar or tractor",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={20}
                questionText="Is the main job of any household member connected with agriculture, hunting, forestry, fishery, mining, or quarrying?"
                options={[
                  "Yes",
                  "No",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={21}
                questionText="If yes to Q20, do they have the right to use land for agriculture, forestry, pasture, livestock breeding, or water surfaces?"
                options={[
                  "Yes",
                  "No",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={22}
                questionText="If yes to Q21, does the household own any non-draught oxen, non-draught buffalo, cows, mythun, horses, or donkeys/mules (including ones rented to others or pawned to others)?"
                options={[
                  "Yes",
                  "No",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={23}
                questionText="What is the major construction material of the floor of their home (observe, do not ask)?"
                options={[
                  "Earth/sand, palm/bamboo, combination earth and wood/palm/bamboo or other",
                  "Wood planks, parquet or polished wood, cement, wood/cement with covering or combination of cement/wood and something else",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />

              <OptionsQuestion
                questionNumber={24}
                questionText="What is the major construction material of the external (outer) walls of their home (observe, do not ask)?"
                options={[
                  "Thatch/large leaves/palm/dhani or tarpaulin",
                  "Bamboo or rudimentary wood",
                  "Unbaked brick and mud, finished wood",
                  "Baked brick and cement or pucca cement",
                  "Did not answer"
                ]}
                allowOther={false}
                questionWidth={this.calcQuestionWidth()}
                l10n={this.l10n}
                submit={this.submitAnswer}
              />




              <button
                className="submitButton"
                disabled={!this.isButtonDisabled()}
                onClick={this.submitQuestionnare.bind(this)}
              >{this.l10n("Submit Questionnaire")}</button>
            </div>
          : <div>
            {
              this.state.firstLoad 
              ? this.afterCoolDown()
              : <Countdown date={Date.now() + 30000} renderer={this.renderer}/>
            }
          </div> 
          
          }
          <br/>
          <div className="downloadLink">
            { this.state.exportData.length > 0
              ? <CSVLink data={this.state.exportData}>Download all results</CSVLink>          
              : null
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
