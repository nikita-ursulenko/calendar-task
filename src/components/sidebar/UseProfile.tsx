import { useAppSession } from "@/entities/session/use-app-session";
import Image from "next/image";

const UserProfile = () => {
  const session = useAppSession();

  return (
    <div className="flex flex-col items-center space-x-4 pb-6 border-b">
      <img
        className="w-16 h-16 rounded-full object-cover"
        src={session.data?.user.image || "/default-avatar.png"}
        alt="Avatar"
      />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-blue-600">{session.data?.user.name}</h2>
        <p className="text-sm text-gray-500">{session.data?.user.email}</p>
      </div>
    </div>
  );
};

export default UserProfile;