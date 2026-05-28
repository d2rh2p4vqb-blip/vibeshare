"use client";
import { useEffect, useState, useRef } from "react";
import TencentCloudChat from '@tencentcloud/chat';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    let chat: any;
    let destroyed = false;
    let currentUserId = '';

    async function init() {
      // Fetch history from our DB
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`);
      const history = await res.json();
      if (!destroyed) setMessages(history);

      // Get UserSig
      const sigRes = await fetch('/api/tim/usersig');
      const { userId, userSig, sdkAppId } = await sigRes.json();
      currentUserId = userId;

      // Init TIM SDK
      chat = TencentCloudChat.create({ SDKAppID: Number(sdkAppId) });

      chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, (event: any) => {
        const newMsgs = event.data
          .filter((msg: any) => msg.from !== currentUserId)
          .map((msg: any) => ({
            id: msg.ID,
            content: msg.payload?.text || '',
            createdAt: new Date(msg.time * 1000).toISOString(),
            user: {
              id: msg.from,
              username: msg.nick || msg.from,
              displayName: msg.nick || msg.from,
              avatarUrl: msg.avatar || null,
            },
          }));
        if (!destroyed && newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs].slice(-200));
        }
      });

      chat.on(TencentCloudChat.EVENT.MESSAGE_MODIFIED, (event: any) => {
        // Handle edited messages if needed
        console.log('Message modified:', event.data);
      });

      chat.on(TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED, () => {
        // Optional: handle conversation updates
      });

      // Login to TIM
      try {
        await chat.login({ userID: userId, userSig });
        // Join the group
        try {
          await chat.joinGroup({ groupID: roomId, type: TencentCloudChat.TYPES.GRP_AVCHATROOM });
        } catch (e: any) {
          // Group might not exist yet in TIM, ignore for now
          console.log('Join group pending:', e.message);
        }
        if (!destroyed) setReady(true);
      } catch (err) {
        console.error('TIM login failed:', err);
      }

      // Notify our server
      fetch(`/api/chat/rooms/${roomId}/join`, { method: 'POST' });
    }

    init();
    chatRef.current = chat;

    return () => {
      destroyed = true;
      if (chat) {
        chat.logout();
      }
      fetch(`/api/chat/rooms/${roomId}/leave`, { method: 'POST' });
    };
  }, [roomId]);

  async function sendMessage(content: string) {
    const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const savedMsg = await res.json();
    if (savedMsg.id) {
      setMessages((prev) => {
        if (prev.some(m => m.id === savedMsg.id)) return prev;
        return [...prev, savedMsg].slice(-200);
      });
    }
    return savedMsg;
  }

  return { messages, sendMessage, ready };
}
