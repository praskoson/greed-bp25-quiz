"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useTransition } from "react";
import { toggleQuizPaused } from "../_lib/actions";

type Props = {
  initialPaused: boolean;
};

export function QuizControl({ initialPaused }: Props) {
  const [quizPaused, setQuizPaused] = useState(initialPaused);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const newSettings = await toggleQuizPaused();
      setQuizPaused(newSettings.quizPaused);
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quiz Control</CardTitle>
        <CardDescription>
          Pause or resume quiz submissions globally
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            quizPaused
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {quizPaused ? "Paused" : "Active"}
        </div>
        <Button
          variant={quizPaused ? "default" : "destructive"}
          onClick={handleToggle}
          disabled={isPending}
        >
          {isPending
            ? "Updating..."
            : quizPaused
              ? "Resume Submissions"
              : "Pause Submissions"}
        </Button>
      </CardContent>
    </Card>
  );
}
