"use client";

/**
 * Tab "Chọn tài khoản có sẵn" — hiển thị list linkable users + search.
 * `UserRow` là radio-item hiển thị 1 user với avatar + role badge.
 */

import { useMemo } from "react";
import { Info, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui-elements/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui-elements/input-group";
import { cn } from "@/lib/utils";
import type { LinkableUser } from "../../hooks/use-link-user-sheet";
import { getInitials } from "./helpers";

interface SelectUserTabProps {
  users: LinkableUser[];
  isLoading: boolean;
  searchKw: string;
  onSearchChange: (v: string) => void;
  selectedUserId: number | null;
  onSelect: (id: number) => void;
}

export function SelectUserTab({
  users,
  isLoading,
  searchKw,
  onSearchChange,
  selectedUserId,
  onSelect,
}: SelectUserTabProps) {
  const filtered = useMemo(() => {
    if (!searchKw.trim()) return users;
    const q = searchKw.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.displayName?.toLowerCase().includes(q) ?? false),
    );
  }, [users, searchKw]);

  return (
    <div className="space-y-3">
      <InputGroup className="bg-card">
        <InputGroupAddon>
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          value={searchKw}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm username, email, họ tên..."
          className="text-xs leading-8 md:text-xs"
        />
      </InputGroup>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Hiển thị {filtered.length} tài khoản</span>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-md border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
          <Users aria-hidden className="mx-auto mb-2 size-6 opacity-40" />
          Không tìm thấy tài khoản phù hợp
        </div>
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              selected={u.id === selectedUserId}
              onSelect={() => onSelect(u.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Không thấy tài khoản phù hợp? Chuyển sang tab{" "}
          <strong>&ldquo;Tạo tài khoản mới&rdquo;</strong>.
        </span>
      </div>
    </div>
  );
}

// ─── Sub: single user row ────────────────────────────────────────────────────

function UserRow({
  user,
  selected,
  onSelect,
}: {
  user: LinkableUser;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-md border px-2.5 py-2 transition-colors",
          selected
            ? "border-primary/40 bg-[var(--color-primary-soft)]"
            : "border-border bg-card hover:bg-muted/40",
        )}
      >
        <input
          type="radio"
          name="linkable-user"
          checked={selected}
          onChange={onSelect}
          className="size-3.5 shrink-0 accent-primary"
        />
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
          {getInitials(user.displayName ?? user.username)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-xs font-semibold text-foreground">
            {user.username}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            {user.email}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge
            variant="outline"
            tone="neutral"
            className="h-5 px-1.5 text-[10px]"
          >
            {user.roleName ?? "—"}
          </Badge>
        </div>
      </label>
    </li>
  );
}
