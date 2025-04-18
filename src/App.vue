<template>
  <div v-if="showPopup" class="popup-message">
    {{ message }}
  </div>

  <div class="high-scores-container">
    <h2>🏆 High Scores</h2>
    <div class="high-scores-wrapper">
      <div class="high-scores-list">
        <div
          v-for="(entry, i) in sortedHighScores"
          :key="entry.timestamp"
          class="score-entry"
          :class="{ topScore: i < 3 }"
        >
          <span class="rank-icon" v-if="i < 3">
            {{ ["🥇", "🥈", "🥉"][i] }}
          </span>
          <span class="rank-number" v-else>{{ i + 1 }}</span>
          <strong>{{ entry.name }}</strong> {{ entry.score }} / 12
        </div>
      </div>
    </div>
  </div>

  <div class="app-container">
    <h1>Rounding Off to Nearest 10</h1>
    <form @submit.prevent="handleSubmit">
      <div class="header">
        <label>
          Name:
          <input type="text" v-model="name" placeholder="Enter your name" />
        </label>
        <span class="score">Score: {{ score }}</span>
      </div>

      <p class="instruction">Circle the correct answers.</p>

      <div class="questions">
        <div v-for="(q, index) in questions" :key="index" class="question-card">
          <p>{{ index + 1 }}. {{ q.question }}</p>
          <div class="choices">
            <label
              v-for="(choice, i) in q.choices"
              :key="i"
              :class="getAnswerClass(index, choice)"
            >
              <input
                type="radio"
                :name="'q' + index"
                :value="choice"
                v-model="answers[index]"
                class="hidden-input"
              />
              <span class="choice-label"
                >{{ String.fromCharCode(65 + i) }}.</span
              >
              {{ choice }}
            </label>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn-red" type="button" @click="resetAnswers">
          Reset
        </button>
        <button class="btn-green" type="submit">Submit</button>
      </div>
    </form>

    <footer>
      <p>copyright: www.mathinenglish.com</p>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick, computed } from "vue";
import { database, ref as dbRef, push } from "./firebase";
import { onValue, query, orderByChild } from "firebase/database";

const name = ref("");
const score = ref(null);
const answers = reactive(Array(12).fill(""));
const highScores = ref([]);
const userScoreRef = ref(null);
const isSubmitted = ref(false);

const sortedHighScores = computed(() => {
  return [...highScores.value].sort(
    (a, b) => b.score - a.score || b.timestamp - a.timestamp
  );
});

const correctAnswers = [
  "20",
  "50",
  "70",
  "20",
  "70",
  "0",
  "100",
  "200",
  "100",
  "170",
  "450",
  "1000",
];

const questions = [
  {
    question: "17 rounded off to the nearest 10 is..",
    choices: ["10", "20", "17"],
  },
  {
    question: "45 rounded off to the nearest 10 is..",
    choices: ["50", "45", "40"],
  },
  {
    question: "75 rounded off to the nearest 10 is..",
    choices: ["70", "80", "175"],
  },
  {
    question: "19 rounded off to the nearest 10 is..",
    choices: ["20", "10", "19"],
  },
  {
    question: "64 rounded off to the nearest 10 is..",
    choices: ["64", "70", "60"],
  },
  {
    question: "0 rounded off to the nearest 10 is..",
    choices: ["10", "1", "0"],
  },
  {
    question: "98 rounded off to the nearest 10 is..",
    choices: ["80", "100", "89"],
  },
  {
    question: "199 rounded off to the nearest 10 is..",
    choices: ["190", "100", "200"],
  },
  {
    question: "94 rounded off to the nearest 10 is..",
    choices: ["100", "94", "90"],
  },
  {
    question: "165 rounded off to the nearest 10 is..",
    choices: ["160", "170", "150"],
  },
  {
    question: "445 rounded off to the nearest 10 is..",
    choices: ["450", "440", "500"],
  },
  {
    question: "999 rounded off to the nearest 10 is..",
    choices: ["990", "1,000", "909"],
  },
];

const resetAnswers = () => {
  for (let i = 0; i < answers.length; i++) answers[i] = "";
  score.value = null;
  isSubmitted.value = false;
};

const message = ref("");
const showPopup = ref(false);

const showMessage = (msg) => {
  message.value = msg;
  showPopup.value = true;
  setTimeout(() => {
    showPopup.value = false;
  }, 3000);
};

const handleSubmit = async () => {
  if (!name.value.trim()) {
    showMessage("Please enter your name before submitting.");
    return;
  }

  isSubmitted.value = true;

  let userScore = 0;
  answers.forEach((ans, i) => {
    if (ans === correctAnswers[i]) userScore++;
  });
  score.value = userScore + " / 12";

  try {
    await push(dbRef(database, "scores"), {
      name: name.value,
      score: userScore,
      timestamp: Date.now(),
    });

    showMessage("Score submitted successfully!");
    await nextTick();

    setTimeout(() => {
      const el = userScoreRef.value;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight");
        setTimeout(() => el.classList.remove("highlight"), 3000);
      }
    }, 500);
  } catch (e) {
    console.error("Failed to save score:", e);
    showMessage("Failed to submit score. Please try again.");
  }
};

const loadHighScores = () => {
  const scoresRef = query(dbRef(database, "scores"), orderByChild("score"));
  onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      highScores.value = Object.values(data).sort(
        (a, b) => b.score - a.score || b.timestamp - a.timestamp
      );
    } else {
      highScores.value = [];
    }
  });
};

const getAnswerClass = (qIndex, choice) => {
  const selected = answers[qIndex];
  const correct = correctAnswers[qIndex];
  if (!isSubmitted.value) return selected === choice ? "selected-answer" : "";
  if (choice === correct && selected !== correct) return "correct-answer";
  if (choice === selected && selected !== correct) return "wrong-answer";
  if (choice === correct && selected === correct) return "correct-selected";
  return "";
};

onMounted(() => {
  loadHighScores();
});
</script>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Arial", sans-serif;
}

h1 {
  text-align: center;
  padding: 1rem;
  border-radius: 10px;
  font-size: 2em;
}

.header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.score {
  font-weight: bold;
}

.instruction {
  font-style: italic;
}

.questions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.question-card {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: transform 0.2s;
}

.question-card:hover {
  transform: scale(1.01);
}

.choices {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  margin-left: 1em;
}

.choices label {
  position: relative;
  padding-left: 20px;
  cursor: pointer;
}

.choices label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) translateX(20%);
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 50%;
  opacity: 0;
  transition: border 0.3s ease, opacity 0.3s ease;
}

.choices label:hover::before {
  border-color: yellow;
  opacity: 1;
}

.choices label.correct-answer::before {
  border-color: green;
  opacity: 1;
}

.choices label.wrong-answer::before {
  border-color: red;
  opacity: 1;
}

.choices label.correct-selected::before {
  border-color: green;
  opacity: 1;
}

.choices label.selected-answer::before {
  border-color: orange;
  opacity: 1;
}

.choice-label {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-right: 0.5rem;
}

.hidden-input {
  display: none;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.8;
}

.btn-red {
  background-color: rgb(212, 15, 15);
}

.btn-green {
  background-color: #4caf50;
}

button:hover {
  filter: brightness(1.2);
  opacity: 1;
}

footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: #777;
}

.popup-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #333;
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.2rem;
  z-index: 9999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.high-scores-container {
  margin-top: 3rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  max-height: 400px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
}

.high-scores-container h2 {
  margin-bottom: 0.5rem;
  text-align: center;
}

.high-scores-wrapper {
  width: 100%;
  height: 315px;
  overflow-y: scroll;
  scrollbar-width: thin;
}

.high-scores-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.score-entry {
  padding: 0.75rem 2rem;
  border-radius: 10px;
  background: #f3f3f3;
  color: black;
  display: flex;
  align-items: center;
  transition: background 0.3s;
  flex-wrap: wrap;
}

.score-entry strong {
  flex: 1;
}

.rank-icon,
.rank-number {
  font-size: 1.3rem;
  margin-right: 1rem;
}

/* Animation */
.highlight {
  animation: pop-border 1.5s ease-out;
}

@keyframes pop-border {
  0% {
    transform: scale(1);
    border-color: #4caf50;
  }
  50% {
    transform: scale(1.05);
    border-color: #66bb6a;
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .questions {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-entry {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }

  .rank-icon,
  .rank-number {
    font-size: 1.1rem;
  }
}
</style>
