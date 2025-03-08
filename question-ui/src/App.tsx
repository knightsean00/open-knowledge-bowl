import { useEffect, useState } from 'react'

import questions from "./questions.json";



function App() {
  const [start, setStart] = useState(false);
  const [selectQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [numberOfTeams, setNumberOfTeams] = useState(3);
  const [teamScore, setTeamScore] = useState<number[]>([]);

  useEffect(() => {
    setTotalQuestions(Object.entries(questions).reduce((prevVal, curVal) => selectQuestions.includes(curVal[0]) ? prevVal + curVal[1].length : prevVal, 0))
  }, [selectQuestions])

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
    }

    setTeamScore(new Array(numberOfTeams).fill(0));
    setStart(true);
  }

  console.log(setSelectedQuestions)
  console.log()


  return (
    <div style={{ display: "flex", flexDirection:"column", marginTop: "5rem"}}>
      <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}} >
        <label>Number of Teams</label>
        <input value={numberOfTeams} onChange={(ev) => setNumberOfTeams(parseInt(ev.target.value.length > 0 ? ev.target.value : "0"))}></input>
      </div>
      <div style={{marginTop: "6rem", marginBottom: "6rem", flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection: "column"}}>
        {
          Object.entries(questions).map(val => (
            <div style={{flex: 1, marginTop: "2rem"}}>
              <label>{val[0]} - # of Questions {val[1].length}</label>
              <input type="checkbox" checked={selectQuestions.includes(val[0])} onClick={() => {
                if (selectQuestions.includes(val[0])) {
                  setSelectedQuestions((old) => {
                    const idx = old.indexOf(val[0]);
                    return [...old.slice(0, idx), ...old.slice(idx + 1)]
                  })
                } else {
                  setSelectedQuestions((old) => [...old, val[0]])
                }
              }}></input>
            </div>
          ))
        }
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <p style={{ flex: 1 }}>Total Questions: {totalQuestions}</p>
        <button style={{ flex: 1 }} className="big" onClick={checkStart}>Start</button>
      </div>
    </div>
  )
}

export default App
