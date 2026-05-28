import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { CreateRoomModal } from "@/components/chat/CreateRoomModal";

export default function ChatListPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">群聊</h1>
        <CreateRoomModal />
      </div>
      <ChatRoomList />
    </div>
  );
}
