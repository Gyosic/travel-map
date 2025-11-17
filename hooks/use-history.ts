import { User } from "next-auth";
import { create } from "zustand";
import { HistoryType } from "@/lib/schema/history.schema";

interface HistoryState {
  histories: Array<HistoryType>;
  setHistory: (histories: Array<HistoryType>) => void;
}

const histories: Array<HistoryType> = [];

export const useHistory = create<HistoryState>((set) => ({
  histories,
  setHistory: (histories: Array<HistoryType>) => set(() => ({ histories })),
}));

interface UserState {
  user: User;
  setUser: (nav: User) => void;
}

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.webp",
};
export const useUser = create<UserState>((set) => ({
  user,
  setUser: (user: User) => set(() => ({ user })),
}));
