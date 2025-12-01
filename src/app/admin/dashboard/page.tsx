import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizQuestionsManager } from "../_components/quiz-questions-manager";
import { QuizControl } from "../_components/quiz-control";
import { UserListCard } from "../_components/user-list-card";
import {
  getQuestionsGroupedByCategory,
  getVerifiedUsersWithQuestions,
  getVerifiedUsersWithQuestionsCount,
  getCompletedQuizUsers,
  getCompletedQuizUsersCount,
  getPendingVerificationUsers,
  getPendingVerificationUsersCount,
} from "../_lib/queries";
import { SettingsService } from "@/lib/settings/settings.service";
import { getDlqMessages } from "@/lib/qstash/client";
import { DlqMessageList } from "../_components/dlq-message-list";

const PREVIEW_LIMIT = 5;

export default async function AdminDashboard() {
  const [
    categories,
    settings,
    verifiedUsers,
    verifiedUsersCount,
    completedUsers,
    completedUsersCount,
    pendingUsers,
    pendingUsersCount,
    dlqMessages,
  ] = await Promise.all([
    getQuestionsGroupedByCategory(),
    SettingsService.getSettings(),
    getVerifiedUsersWithQuestions({ limit: PREVIEW_LIMIT }),
    getVerifiedUsersWithQuestionsCount(),
    getCompletedQuizUsers({ limit: PREVIEW_LIMIT }),
    getCompletedQuizUsersCount(),
    getPendingVerificationUsers({ limit: PREVIEW_LIMIT }),
    getPendingVerificationUsersCount(),
    getDlqMessages(),
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Quiz Control */}
      <QuizControl initialPaused={settings.quizPaused} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Users</CardDescription>
            <CardTitle className="text-2xl">{verifiedUsersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
            <CardTitle className="text-2xl">{pendingUsersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quiz Completed</CardDescription>
            <CardTitle className="text-2xl">{completedUsersCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600">
              Dead Letter Queue
            </CardDescription>
            <CardTitle className="text-2xl text-red-700">
              {dlqMessages.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* User Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Users with Questions */}
        <UserListCard
          title="Verified Users (Questions Assigned)"
          description="Users who have staked and been assigned quiz questions"
          users={verifiedUsers}
          totalCount={verifiedUsersCount}
          viewAllHref="/admin/users/verified"
          emptyMessage="No verified users yet"
        />

        {/* Pending Verification */}
        <UserListCard
          title="Pending Verification"
          description="Users awaiting stake verification"
          users={pendingUsers}
          totalCount={pendingUsersCount}
          viewAllHref="/admin/users/pending"
          emptyMessage="No pending verifications"
        />

        {/* Completed Users */}
        <UserListCard
          title="Quiz Completed"
          description="Users who have finished the quiz"
          users={completedUsers}
          totalCount={completedUsersCount}
          viewAllHref="/admin/users/completed"
          emptyMessage="No completed quizzes yet"
        />

        {/* Dead Letter Queue */}
        <DlqMessageList messages={dlqMessages} />
      </div>

      {/* Quiz Questions Management */}
      <div className="mt-6">
        <QuizQuestionsManager categories={categories} />
      </div>
    </main>
  );
}
