<template>
  <div v-if="showPopup" class="popup-message">
    {{ message }}
  </div>

  <div class="high-scores">
    <h2>🏆 High Scores</h2>
    <ul>
      <li v-for="(entry, i) in highScores" :key="i">
        <strong>{{ entry.name }}</strong
        >: {{ entry.score }} / 12
      </li>
    </ul>
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
import { reactive, ref, onMounted } from "vue";
import { database, ref as dbRef, push } from "./firebase"; // 👈 Import Firebase
import { onValue, query, orderByChild, limitToLast } from "firebase/database";

const name = ref("");
const score = ref(null);
const answers = reactive(Array(12).fill(""));
const highScores = ref([]);

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
  for (let i = 0; i < answers.length; i++) {
    answers[i] = "";
  }
  score.value = null;
};

const message = ref("");
const showPopup = ref(false);

const showMessage = (msg) => {
  message.value = msg;
  showPopup.value = true;
  setTimeout(() => {
    showPopup.value = false;
  }, 3000); // Hide after 3 seconds
};

const handleSubmit = async () => {
  if (!name.value.trim()) {
    showMessage("⚠️ Please enter your name before submitting.");
    return;
  }

  let userScore = 0;
  answers.forEach((ans, i) => {
    if (ans === correctAnswers[i]) {
      userScore++;
    }
  });
  score.value = userScore + " / 12";

  try {
    await push(dbRef(database, "scores"), {
      name: name.value,
      score: userScore,
      timestamp: Date.now(),
    });
    showMessage("✅ Score submitted successfully!");
  } catch (e) {
    console.error("Failed to save score:", e);
    showMessage("❌ Failed to submit score. Please try again.");
  }
};

// Fetch high scores
const loadHighScores = () => {
  const scoresRef = query(
    dbRef(database, "scores"),
    orderByChild("score"),
    limitToLast(5)
  );

  onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object to array and sort descending
      highScores.value = Object.values(data).sort(
        (a, b) => b.score - a.score || b.timestamp - a.timestamp
      );
    } else {
      highScores.value = [];
    }
  });
};

const getAnswerClass = (qIndex, choice) => {
  return answers[qIndex] === choice ? "selected-answer" : "";
};

// Load on mount
onMounted(() => {
  loadHighScores();
});
</script>

<style scoped>
.high-scores {
  margin-top: 3rem;
  padding: 1rem;
  /* background: #f9f9f9; */
  border: 2px solid #ddd;
  border-radius: 12px;
}

.high-scores h2 {
  margin-bottom: 0.5rem;
}

.high-scores ul {
  list-style: none;
  padding-left: 0;
}

.high-scores li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Arial", sans-serif;
}
h1 {
  text-align: center;
  /* background-color: #f4f4f4; */
  padding: 1rem;
  border-radius: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  /* background-color: black; */
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: transform 0.2s;
}
.question-card:hover {
  transform: scale(1.01);
}

.choices label {
  position: relative;
  padding-left: 20px;
  cursor: pointer;
}

.choices {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  margin-left: 1em;
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
  border-color: red;
  opacity: 1;
}

.choices label.selected-answer::before {
  border-color: red;
  opacity: 1;
}

.hidden-input {
  display: none;
}

.choice-label {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-right: 0.5rem;
}

@keyframes pulseCircle {
  0% {
    transform: scale(0.6) translateY(-50%);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(-50%);
    opacity: 1;
  }
}

@keyframes popHighlight {
  0% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .questions {
    grid-template-columns: 1fr;
  }
}
</style>
