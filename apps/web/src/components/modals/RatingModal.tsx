"use client";

import { X } from "lucide-react";
import { useState } from "react";

type RatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    overall: number;
    skill: number;
    attitude: number;
    punctuality: number;
    comment: string;
  }) => Promise<void> | void;
};

export function RatingModal({ isOpen, onClose, onSubmit }: RatingModalProps) {
  const [overall, setOverall] = useState(5);
  const [skill, setSkill] = useState(5);
  const [attitude, setAttitude] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ overall, skill, attitude, punctuality, comment });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Đánh giá đối thủ
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 text-sm">
          <label className="grid gap-2 text-slate-600">
            Tổng quan
            <input
              type="range"
              min="1"
              max="5"
              value={overall}
              onChange={(event) => setOverall(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2 text-slate-600">
            Trình độ
            <input
              type="range"
              min="1"
              max="5"
              value={skill}
              onChange={(event) => setSkill(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2 text-slate-600">
            Thái độ
            <input
              type="range"
              min="1"
              max="5"
              value={attitude}
              onChange={(event) => setAttitude(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2 text-slate-600">
            Đúng giờ
            <input
              type="range"
              min="1"
              max="5"
              value={punctuality}
              onChange={(event) => setPunctuality(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2 text-slate-600">
            Bình luận
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Gửi đánh giá
          </button>
        </div>
      </form>
    </div>
  );
}
