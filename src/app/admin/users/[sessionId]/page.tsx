import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserWithQuestions } from "../../_lib/queries";
import { UserControls } from "../../_components/user-controls";
import { AssignQuestionsButton } from "../../_components/assign-questions-button";
import { RetryVerificationButton } from "../../_components/retry-verification-button";

type Props = {
  params: Promise<{ sessionId: string }>;
};

function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(5);
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  return `${days} days`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const user = await getUserWithQuestions(sessionId);

  if (!user) {
    notFound();
  }

  const isCompleted = user.completedAt !== null;
  const hasAnswers = user.questions.some((q) => q.userAnswer !== null);
  const isPendingVerification = user.stakeVerification === "processing";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-foreground">
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </Button>
        <UserControls
          sessionId={sessionId}
          hasAnswers={hasAnswers}
          isShadowBanned={user.shadowBan ?? false}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-mono">{user.walletAddress}</CardTitle>
              <CardDescription>User session details</CardDescription>
            </div>
            {isCompleted && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {user.score}/{user.questionCount}
                </div>
                <div className="text-muted-foreground text-xs">Score</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Stake Amount</dt>
              <dd className="font-medium">
                {formatSol(user.stakeAmountLamports)} SOL
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stake Duration</dt>
              <dd className="font-medium">
                {formatDuration(user.stakeDurationSeconds)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Session Created</dt>
              <dd className="font-medium">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {isCompleted ? "Completed At" : "Status"}
              </dt>
              <dd className="font-medium">
                {isCompleted ? formatDate(user.completedAt!) : "In Progress"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stake Verification</dt>
              <dd className="font-medium">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.stakeVerification === "success"
                      ? "bg-green-100 text-green-700"
                      : user.stakeVerification === "processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.stakeVerification}
                </span>
              </dd>
            </div>
          </dl>
          {isPendingVerification && (
            <div className="mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-2 text-sm">
                Verification is stuck. You can retry the verification job.
              </p>
              <RetryVerificationButton sessionId={sessionId} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isCompleted ? "Quiz Results" : "Assigned Questions"}
          </CardTitle>
          <CardDescription>
            {isCompleted
              ? "Questions and answers from this user's quiz"
              : "Questions assigned to this user for the quiz"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.questions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No questions have been assigned to this user yet.
              </p>
              <AssignQuestionsButton sessionId={sessionId} />
            </div>
          ) : (
            <div className="space-y-4">
              {user.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-surface-3 rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        question.userAnswer
                          ? question.userAnswer.isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-brand text-foreground-1"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {question.questionText}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Category: {question.categoryName}
                      </p>
                    </div>
                  </div>

                  {/* Show answers */}
                  <div className="ml-9 space-y-1.5">
                    {question.allAnswers.map((answer) => {
                      const isUserAnswer =
                        question.userAnswer?.id === answer.id;
                      const isCorrectAnswer = answer.isCorrect;

                      let bgClass = "bg-surface-4";
                      let borderClass = "";
                      let textClass = "text-sm";

                      if (isUserAnswer && isCorrectAnswer) {
                        bgClass = "bg-green-50";
                        borderClass = "border-2 border-green-500";
                        textClass = "text-sm text-green-700";
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        bgClass = "bg-red-50";
                        borderClass = "border-2 border-red-500";
                        textClass = "text-sm text-red-700";
                      } else if (isCorrectAnswer && question.userAnswer) {
                        bgClass = "bg-green-50";
                        borderClass = "border border-green-300";
                        textClass = "text-sm text-green-700";
                      }

                      return (
                        <div
                          key={answer.id}
                          className={`rounded px-3 py-2 ${bgClass} ${borderClass}`}
                        >
                          <span className={textClass}>
                            {answer.answerText}
                            {isUserAnswer && (
                              <span className="ml-2 text-xs font-medium">
                                ← User&apos;s answer
                              </span>
                            )}
                            {isCorrectAnswer &&
                              !isUserAnswer &&
                              question.userAnswer && (
                                <span className="ml-2 text-xs font-medium">
                                  ← Correct answer
                                </span>
                              )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
