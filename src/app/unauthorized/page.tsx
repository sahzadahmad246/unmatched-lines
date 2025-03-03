// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p className="mb-4">You do not have permission to access the admin area.</p>
        <a href="/" className="text-blue-500 hover:underline">Return to Homepage</a>
      </div>
    );
  }