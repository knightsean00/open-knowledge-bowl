import { useEffect, useState } from 'react'

import arrayShuffle from 'array-shuffle';

import questions from "./questions.json";
import { QuestionBank, QuestionArray } from './Types';
import QuestionPage from './QuestionPage';

const questionBank = questions as QuestionBank;

function App() {
  const [start, setStart] = useState(false);
  const [selectQuestionBank, setSelectQuestionBank] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [numberOfTeams, setNumberOfTeams] = useState(3);
  const [showAnswers, setShowAnswers] = useState(true);
  const [teamScore, setTeamScore] = useState<number[]>([]);

  // Set right before start
  const [selectQuestions, setSelectedQuestions] = useState<QuestionArray>([]);

  useEffect(() => {
    setTotalQuestions(Object.entries(questionBank).reduce((prevVal, curVal) => selectQuestionBank.includes(curVal[0]) ? prevVal + curVal[1].length : prevVal, 0))
  }, [selectQuestionBank])

  const checkStart = () => {
    if (start) {
      alert("Game has already started, cannot restart");
      return;
    }

    if (numberOfTeams < 0) {
      alert("You must choose a number of teams greater than 0");
      return;
    }

    if (totalQuestions <= 0) {
      alert("You must select at least one valid question pack");
      return;
    }

    setTeamScore(new Array(numberOfTeams).fill(0));
    setSelectedQuestions(() => {
      const startingQuestions: QuestionArray = [];
      return arrayShuffle(Object.entries(questionBank).reduce((prevVal, curVal) => selectQuestionBank.includes(curVal[0]) ? [...prevVal, ...curVal[1]] : prevVal, startingQuestions));
    });
    setStart(true);
  }

  if (start) {
    return (
      <QuestionPage teamScores={teamScore} setTeamScores={setTeamScore} selectQuestions={selectQuestions} setQuestions={setSelectedQuestions} showAnswers={showAnswers} setShowAnswers={setShowAnswers} />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: "5rem" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} >
        <label>Number of Teams</label>
        <input value={numberOfTeams} onChange={(ev) => setNumberOfTeams(parseInt(ev.target.value.length > 0 ? ev.target.value : "0"))}></input>
      </div>
      <div style={{ marginTop: "6rem", marginBottom: "6rem", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {
          Object.entries(questionBank).map(val => (
            <div style={{ flex: 1, marginTop: "2rem" }} key={val[0]}>
              <label>{val[0]} - # of Questions {val[1].length}</label>
              <input type="checkbox" checked={selectQuestionBank.includes(val[0])} onClick={() => {
                if (selectQuestionBank.includes(val[0])) {
                  setSelectQuestionBank((old) => {
                    const idx = old.indexOf(val[0]);
                    return [...old.slice(0, idx), ...old.slice(idx + 1)]
                  })
                } else {
                  setSelectQuestionBank((old) => [...old, val[0]])
                }
              }}></input>
            </div>
          ))
        }
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ flex: 1, marginTop: "2rem" }} >
          <label>Show Answers</label>
          <input type="checkbox" checked={showAnswers} onClick={() => setShowAnswers(!showAnswers)} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", marginTop: "2rem" }}>
        <p style={{ flex: 1 }}>Total Questions: {totalQuestions}</p>
        <button style={{ flex: 1 }} className="big" onClick={checkStart}>Start</button>
      </div>
    </div>
  )
}

export default App
