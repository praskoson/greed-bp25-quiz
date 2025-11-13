import { loadEnvConfig } from "@next/env";
import { quizCategories, quizQuestions, quizAnswers } from "../lib/db/schema";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

interface QuizRow {
  Lesson: string;
  Question: string;
  "Choice A": string;
  "Choice B": string;
  "Choice C": string;
  "Choice D": string;
  Answer: string;
}

async function populateQuizData(csvFilePath: string) {
  try {
    const { db } = await import("../lib/db/index.js");

    // Read and parse CSV
    const fileContent = readFileSync(csvFilePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as QuizRow[];

    console.log(`Found ${records.length} questions in CSV`);

    // Track categories to avoid duplicate inserts
    const categoryCache = new Map<string, string>(); // name -> id

    for (const [index, row] of records.entries()) {
      console.log(
        `Processing question ${index + 1}/${records.length}: ${row.Lesson}`,
      );

      // 1. Get or create category
      let categoryId = categoryCache.get(row.Lesson);

      if (!categoryId) {
        // Check if category exists
        const existingCategory = await db
          .select()
          .from(quizCategories)
          .where(eq(quizCategories.name, row.Lesson))
          .limit(1);

        if (existingCategory.length > 0) {
          categoryId = existingCategory[0].id;
        } else {
          // Create new category
          const [newCategory] = await db
            .insert(quizCategories)
            .values({
              name: row.Lesson,
            })
            .returning();
          categoryId = newCategory.id;
        }

        categoryCache.set(row.Lesson, categoryId);
        console.log(`  Category: ${row.Lesson} (${categoryId})`);
      }

      // 2. Create question
      const [question] = await db
        .insert(quizQuestions)
        .values({
          categoryId,
          questionText: row.Question,
        })
        .returning();

      console.log(`  Created question: ${question.id}`);

      // 3. Create answers
      const choices = [
        { letter: "A", text: row["Choice A"] },
        { letter: "B", text: row["Choice B"] },
        { letter: "C", text: row["Choice C"] },
        { letter: "D", text: row["Choice D"] },
      ];

      const correctAnswer = row.Answer.toUpperCase();

      for (const choice of choices) {
        await db.insert(quizAnswers).values({
          questionId: question.id,
          answerText: choice.text,
          isCorrect: choice.letter === correctAnswer,
        });
      }

      console.log(`  Created 4 answers (correct: ${correctAnswer})`);
    }

    console.log("\n✅ Successfully populated quiz data!");
    console.log(`Categories: ${categoryCache.size}`);
    console.log(`Questions: ${records.length}`);
    console.log(`Answers: ${records.length * 4}`);
  } catch (error) {
    console.error("Error populating quiz data:", error);
    throw error;
  }
}

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

populateQuizData(join(__dirname, "quiz_questions.csv"))
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
