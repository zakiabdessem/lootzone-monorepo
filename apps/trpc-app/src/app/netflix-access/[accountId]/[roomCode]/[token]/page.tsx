import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import CredentialsCard from "~/app/_components/netflix/CredentialsCard";

type PageProps = {
    params: Promise<{
        accountId: string;
        roomCode: string;
        token: string;
    }>;
};

export default async function NetflixAccessPage({ params }: PageProps) {
    const { accountId, roomCode, token } = await params;

    try {
        const credentials = await serverApi.netflix.getAccountByToken({
            accountId,
            roomCode,
            token,
        });

        return (
            <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center p-4 pt-4 pb-12">
                <CredentialsCard
                    email={credentials.email}
                    password={credentials.password}
                    roomCode={credentials.roomCode}
                    pinCode={credentials.pinCode}
                />
            </div>
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isExpired = errorMessage.toLowerCase().includes("expired");
        const isInvalid = errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("unauthorized");

        if (isExpired || isInvalid) {
            return (
                <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center p-4 pt-32 pb-12">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-none shadow-lg p-8 text-center border border-gray-100">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-[#212121] mb-3">
                                {isExpired ? "Link Expired" : "Invalid Access Link"}
                            </h1>
                            <p className="text-gray-600 leading-relaxed">
                                {isExpired
                                    ? "This access link has expired. Please contact the administrator for a new link."
                                    : "This access link is invalid or has been revoked. Please contact the administrator."}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        notFound();
    }
}

