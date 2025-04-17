<template>
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
            <label v-for="(choice, i) in q.choices" :key="i">
              <input
                type="radio"
                :name="'q' + index"
                :value="choice"
                v-model="answers[index]"
              />
              {{ choice }}
            </label>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button type="button" @click="resetAnswers">Reset</button>
        <button type="submit">Submit</button>
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

const handleSubmit = async () => {
  if (!name.value.trim()) {
    alert("Please enter your name before submitting.");
    return;
  }

  let userScore = 0;
  answers.forEach((ans, i) => {
    if (ans === correctAnswers[i]) {
      userScore++;
    }
  });
  score.value = userScore + " / 12";

  // 👇 Log to Firebase
  try {
    await push(dbRef(database, "scores"), {
      name: name.value,
      score: userScore,
      timestamp: Date.now(),
    });
    console.log("Score saved!");
  } catch (e) {
    console.error("Failed to save score:", e);
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
  display: block;
  margin-top: 5px;
}

.choices {
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
}
button:hover {
  background-color: #45a049;
}
footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: #777;
}
@media (max-width: 768px) {
  .questions {
    grid-template-columns: 1fr;
  }
}
</style>
