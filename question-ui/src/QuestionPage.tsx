import { QuestionArray, SupplementType } from './Types';
import { useState, useEffect } from 'react';
import useSound from 'use-sound';

interface QuestionPageProps {
  teamScores: number[],
  setTeamScores: React.Dispatch<React.SetStateAction<number[]>>
  selectQuestions: QuestionArray,
  setQuestions: React.Dispatch<React.SetStateAction<QuestionArray>>,
  showAnswers: boolean,
  setShowAnswers: React.Dispatch<React.SetStateAction<boolean>>,
}


const QuestionPage: React.FC<QuestionPageProps> = ({
  teamScores,
  setTeamScores,
  selectQuestions,
  setQuestions,
  showAnswers,
  setShowAnswers,
}) => {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [soundUrl, setSoundUrl] = useState("https://archive.org/download/78_merry-christmas_korla-pandit-jette-satin-i-berlin_gbia0340413/03%20-%20AVA%20MARIA%20-%20KORLA%20PANDIT%20-%20Schubert.mp3");
  const [play, { stop }] = useSound(soundUrl);

  const moveToNextQuestion = () => {
    setQuestions((old) => {
      const toReturn = old.slice(1);
      if (toReturn[0].Supplement != undefined && toReturn[0].Supplement.Type == SupplementType.SOUND) {
        console.log("setting sound to", toReturn[0].Supplement.Data);
        setSoundUrl(toReturn[0].Supplement.Data);
      }
      return toReturn;
    });

    setQuestionNumber((old) => old + 1);
  }

  useEffect(() => {
    console.log("in sound url")
    if (soundUrl.length > 0) {
      console.log("playing")
      play();
    } else {
      console.log("stopping")
      stop();
    }
  }, [soundUrl]);

  if (selectQuestions.length === 0) {
    const indexedArray = teamScores.map((value, idx) => ({ value, idx }));
    indexedArray.sort((a, b) => b.value - a.value);
    const rankingArray: number[] = new Array(teamScores.length);
    indexedArray.forEach((item, rank) => {
      rankingArray[item.idx] = rank;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", marginTop: "3rem", alignItems: "center", wordBreak: "normal" }}>
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

  let questionSupplement = (<></>);
  if (selectQuestions[0].Supplement != undefined) {
    switch (selectQuestions[0].Supplement.Type) {
      case SupplementType.PICTURE:
        questionSupplement = (<img src={selectQuestions[0].Supplement.Data} />);
        break;
      case SupplementType.EMBED:
        questionSupplement = (<iframe height="675px" width="1200px" src={selectQuestions[0].Supplement.Data} style={{ border: "none" }} allow="autoplay" />);
        break;
      case SupplementType.SOUND:
        break;
      default:
        break;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: "3rem", alignItems: "center" }}>
      <div className="row">
        <h3>Question #{questionNumber}</h3>
      </div>
      <div className="row">
        <h3>{selectQuestions.length} Remaining Questions</h3>
      </div>
      <div style={{ maxWidth: "1200px", display: "flex", flexDirection: "column", marginTop: "5rem", alignItems: "center", wordBreak: "normal" }}>
        <h1>{selectQuestions[0].Question}</h1>
        {questionSupplement}
        {
          showAnswers ?
            <h2 style={{ color: "rgb(149, 92, 175)" }}>{selectQuestions[0].Answer}</h2> :
            <></>
        }
      </div>
      <div className="row">
        <button className="big" style={{ marginTop: "10rem" }} onClick={moveToNextQuestion}>None Correct</button>
      </div>
      <div className="row" style={{ width: "100%", marginTop: "3rem", flexWrap: "wrap" }}>
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
      <div className="row" style={{ marginTop: "10rem" }}>
        <label>Show Answers</label>
        <input type="checkbox" checked={showAnswers} onClick={() => setShowAnswers(!showAnswers)} />
      </div>
      <div className="row">
        <button onClick={() => setQuestions([])}>End Game</button>
      </div>
    </div>
  )
}

export default QuestionPage;