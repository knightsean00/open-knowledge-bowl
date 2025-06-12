import { QuestionArray, deezerTrackApiPrefix } from "./Types";
import { useEffect, useState } from "react";
import axios from "axios";
import "./progress.scss";
import AudioPlayer from "react-h5-audio-player";

interface QuestionPageProps {
  teamScores: number[];
  setTeamScores: React.Dispatch<React.SetStateAction<number[]>>;
  selectQuestions: QuestionArray;
  setQuestions: React.Dispatch<React.SetStateAction<QuestionArray>>;
  showAnswers: boolean;
  setShowAnswers: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [audioURL, setAudioURL] = useState<string | null>(null);

  useEffect(() => {
    let isAudio = false;
    if (
      selectQuestions.length > 0 &&
      selectQuestions[0].supplement != undefined
    ) {
      console.log("Might make a request");
      if (selectQuestions[0].supplement.type == "SOUND") {
        setAudioURL(selectQuestions[0].supplement.data);
        isAudio = true;
      } else if (selectQuestions[0].supplement.type == "DEEZER") {
        console.log("Making a request");
        axios
          .get(`${deezerTrackApiPrefix}/${selectQuestions[0].supplement.data}`)
          .then((res) => {
            console.log(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
    if (!isAudio) {
      setAudioURL(null);
    }
  }, [selectQuestions]);

  const moveToNextQuestion = () => {
    setQuestions((old) => {
      return old.slice(1);
    });

    setQuestionNumber((old) => old + 1);
  };

  if (selectQuestions.length === 0) {
    const indexedArray = teamScores.map((value, idx) => ({ value, idx }));
    indexedArray.sort((a, b) => b.value - a.value);
    const rankingArray: number[] = new Array(teamScores.length);
    indexedArray.forEach((item, rank) => {
      rankingArray[item.idx] = rank;
    });

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "3rem",
          alignItems: "center",
          wordBreak: "normal",
        }}
      >
        {rankingArray.map((scoreIdx, idx) => {
          if (idx === 0) {
            return (
              <h1 key={idx}>
                Rank {idx + 1} - {teamScores[scoreIdx]} Questions Correct - Team{" "}
                {scoreIdx + 1}{" "}
              </h1>
            );
          }
          return (
            <h2 key={idx}>
              Rank {idx + 1} - {teamScores[scoreIdx]} Questions Correct - Team{" "}
              {scoreIdx + 1}{" "}
            </h2>
          );
        })}
      </div>
    );
  }

  let questionSupplement = <></>;

  if (selectQuestions[0].supplement != undefined) {
    switch (selectQuestions[0].supplement.type) {
      case "PICTURE":
        questionSupplement = <img src={selectQuestions[0].supplement.data} />;
        break;
      case "EMBED":
        questionSupplement = (
          <iframe
            height="675px"
            width="1200px"
            src={selectQuestions[0].supplement.data}
            style={{ border: "none" }}
            allow="autoplay"
          />
        );
        break;
      case "SOUND":
        questionSupplement = (
          <div style={{ width: "100%", marginBottom: "3rem" }}>
            {audioURL != null ? <AudioPlayer src={audioURL} /> : <></>}
          </div>
        );
        break;
      default:
        break;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: "3rem",
        alignItems: "center",
      }}
    >
      <div className="row">
        <h3>Question #{questionNumber}</h3>
      </div>
      <div className="row">
        <h3>{selectQuestions.length} Remaining Questions</h3>
      </div>
      <div
        style={{
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
          marginTop: "5rem",
          alignItems: "center",
          wordBreak: "normal",
        }}
      >
        <h1>{selectQuestions[0].question}</h1>
        {questionSupplement}
        {showAnswers ? (
          <h2 style={{ color: "rgb(149, 92, 175)" }}>
            {selectQuestions[0].answer}
          </h2>
        ) : (
          <></>
        )}
      </div>
      <div className="row">
        <button
          className="big"
          style={{ marginTop: "10rem" }}
          onClick={moveToNextQuestion}
        >
          None Correct
        </button>
      </div>
      <div
        className="row"
        style={{ width: "100%", marginTop: "3rem", flexWrap: "wrap" }}
      >
        {teamScores.map((val, idx) => {
          return (
            <button
              className="big"
              onClick={() => {
                setTeamScores((old) => {
                  const toSet = [...old];
                  toSet[idx] = val + 1;
                  return toSet;
                });
                moveToNextQuestion();
              }}
            >
              Team {idx + 1} - {val}
            </button>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: "10rem" }}>
        <label>Show Answers</label>
        <input
          type="checkbox"
          checked={showAnswers}
          onClick={() => setShowAnswers(!showAnswers)}
        />
      </div>
      <div className="row">
        <button onClick={() => setQuestions([])}>End Game</button>
      </div>
    </div>
  );
};

export default QuestionPage;
