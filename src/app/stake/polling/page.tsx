export default function PollingPage() {
  // Poll for stake confirmation
  // const pollStakeStatus = async (sessionId: string, token: string) => {
  //   const maxAttempts = 30; // 30 seconds max
  //   let attempts = 0;

  //   const poll = async () => {
  //     try {
  //       const response = await fetch(
  //         `/api/stake/status/route?sessionId=${sessionId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       if (response.ok) {
  //         const data = await response.json();

  //         if (data.stakeConfirmed) {
  //           onSuccess(sessionId);
  //           return;
  //         }
  //       }

  //       attempts++;
  //       if (attempts < maxAttempts) {
  //         setTimeout(poll, 1000); // Poll every second
  //       } else {
  //         onError(
  //           "Verification is taking longer than expected. Please check back later.",
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Polling error:", error);
  //       onError("Failed to verify stake. Please try again.");
  //     }
  //   };

  //   poll();
  // };
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 pt-8 dark:bg-black sm:items-center sm:pt-0">
      <main className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500"></div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Verifying Stake...
          </h2>
          <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            This usually takes a few seconds
          </p>
        </div>
      </main>
    </div>
  );
}
