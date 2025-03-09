import { QuestionArray } from './Types';



interface QuestionPageProps {
  teamScores: number[],
  setTeamScores: React.Dispatch<React.SetStateAction<number[]>>
  selectQuestions: QuestionArray,
  setQuestions: React.Dispatch<React.SetStateAction<QuestionArray>>
}

const QuestionPage: React.FC<QuestionPageProps> = ({
  teamScores,
  setTeamScores,
  selectQuestions,
  setQuestions,
}) => {

  const moveToNextQuestion = () => {
    setQuestions((old) => {
      return old.slice(1);
    })
  }

  if (selectQuestions.length === 0) {
    const indexedArray = teamScores.map((value, idx) => ({ value, idx }));
    indexedArray.sort((a, b) => b.value - a.value);
    const rankingArray: number[] = new Array(teamScores.length);
    indexedArray.forEach((item, rank) => {
      rankingArray[item.idx] = rank;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", marginTop: "3rem", alignItems: "center", wordBreak: "break-all" }}>
        {
          rankingArray.map((scoreIdx, idx) => {
            if (idx === 0) {
              return (
                <h1 key={idx}>Rank {idx + 1} - {teamScores[scoreIdx]} Questions Correct - Team {scoreIdx + 1} </h1>
              );
            }
            return (
              <h2 key={idx}>Rank {idx + 1} - {teamScores[scoreIdx]} Questions Correct - Team {scoreIdx + 1} </h2>
            );
          })
        }
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: "3rem", alignItems: "center" }}>
      <div className="row">
        <h3>{selectQuestions.length} Remaining Questions</h3>
      </div>
      <div style={{ maxWidth: "1200px", display: "flex", flexDirection: "column", marginTop: "5rem", alignItems: "center", wordBreak: "break-all" }}>
        <h1>{selectQuestions[0].Question}</h1>
        <h2 style={{ color: "rgb(149, 92, 175)" }}>{selectQuestions[0].Answer}</h2>
      </div>
      <div className="row">
        <button className="big" onClick={moveToNextQuestion}>None Correct</button>
      </div>
      <div className="row" style={{ width: "100vw", marginTop: "3rem" }}>
        {
          teamScores.map((val, idx) => {
            return (
              <button className="big" onClick={() => {
                setTeamScores((old) => {
                  const toSet = [...old];
                  toSet[idx] = val + 1;
                  return toSet;
                });
                moveToNextQuestion();
              }}>Team {idx + 1} - {val}</button>
            )
          })
        }
      </div>
    </div>
  )
}

export default QuestionPage;