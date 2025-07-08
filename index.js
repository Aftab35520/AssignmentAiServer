const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const multer = require("multer");
const pdf = require("pdf-parse");

const app = express();
app.use(bodyparser.json());
app.use(cors());

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCDDIXRidwq9ootdag1hzSgvKySXQYNMhQ",
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/extract", upload.single("pdf"), async (req, res) => {
  try {
    let prompt = "";
    const question = req.body.question;
    const file = req.file;

    if (file && question) {
      await pdf(file.buffer)
      .then((data) => {
        prompt = data.text + "\n " + question;
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });

    } else if (file) {
      const data = await pdf(file.buffer);
      prompt = data.text;
    } else if (question) {
      prompt = question;
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents:
        prompt +
        'write question before answering with ques number like que 1. what is ... then next line ans:- do not give preemption just answer from 1 st line ',
    });
    
    res.json({ text: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("running");
});
