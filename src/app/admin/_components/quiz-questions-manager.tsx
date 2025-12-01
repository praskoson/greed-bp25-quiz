"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AdminCategory, AdminQuestion, AdminAnswer } from "../_lib/queries";

type Props = {
  categories: AdminCategory[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function QuizQuestionsManager({ categories }: Props) {
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(
    null
  );
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [editedAnswers, setEditedAnswers] = useState<AdminAnswer[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const handleSelectQuestion = (question: AdminQuestion) => {
    setSelectedQuestion(question);
    setEditedQuestionText(question.questionText);
    setEditedAnswers([...question.answers]);
  };

  const handleAnswerChange = (answerId: string, newText: string) => {
    setEditedAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, answerText: newText } : a))
    );
  };

  const handleSave = () => {
    // TODO: API call to save changes
    console.log("Saving:", {
      questionId: selectedQuestion?.id,
      questionText: editedQuestionText,
      answers: editedAnswers,
    });
    setSelectedQuestion(null);
  };

  const handleCancel = () => {
    setSelectedQuestion(null);
    setEditedQuestionText("");
    setEditedAnswers([]);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
          <CardDescription>
            Select a question to edit its text or answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories found</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 py-3 bg-surface-3 text-left font-medium text-sm flex items-center justify-between hover:bg-surface-3/80 transition-colors"
                >
                  <span>{category.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {category.questions.length} questions
                  </span>
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="divide-y">
                    {category.questions.length === 0 ? (
                      <p className="px-4 py-3 text-muted-foreground text-sm">
                        No questions in this category
                      </p>
                    ) : (
                      category.questions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleSelectQuestion(question)}
                          className={`w-full px-4 py-3 text-left hover:bg-surface-4 transition-colors ${
                            selectedQuestion?.id === question.id
                              ? "bg-surface-4 border-l-2 border-brand"
                              : ""
                          }`}
                        >
                          <p className="text-sm line-clamp-2">
                            {question.questionText}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {formatDate(new Date(question.updatedAt))}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
          <CardDescription>
            {selectedQuestion
              ? "Modify the question text or answer options"
              : "Select a question from the list to edit"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedQuestion ? (
            <div className="space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <Input
                  id="questionText"
                  value={editedQuestionText}
                  onChange={(e) => setEditedQuestionText(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <Label>Answer Options</Label>
                {editedAnswers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        answer.isCorrect
                          ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={answer.answerText}
                      onChange={(e) =>
                        handleAnswerChange(answer.id, e.target.value)
                      }
                      className="flex-1"
                    />
                    {answer.isCorrect && (
                      <span className="text-xs text-green-600 font-medium">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} className="bg-brand hover:bg-brand-dark text-foreground-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No question selected
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
