"use client";

/**
 * Tab "Tạo tài khoản mới" — form gồm username, email, tên hiển thị, vai trò,
 * password (auto-gen / manual) + force-reset checkbox.
 *
 * Sub-components:
 *   - `FieldBlock` — label + control + hint wrapper
 *   - `PasswordStrengthBar` — 4-segment bar theo `passwordStrength()`
 *
 * State toàn cục truyền qua `form` + `onChange` — không giữ state cục bộ.
 */

import { Copy, Info, KeyRound, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { Checkbox } from "@/components/ui-elements/checkbox";
import { Input } from "@/components/ui-elements/input";
import { Label } from "@/components/ui-elements/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui-elements/input-group";
import { SelectApp } from "@/components/forms/select-app";
import { cn } from "@/lib/utils";
import {
  DEMO_ROLES,
  generatePassword,
  passwordStrength,
  type CreateForm,
} from "./helpers";

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface CreateUserTabProps {
  employeeFullName: string | null;
  employeeCode: string | null;
  employeeEmail: string | null;
  form: CreateForm;
  onChange: (next: CreateForm) => void;
  onApplySuggestion: () => void;
  onRegeneratePassword: () => void;
}

export function CreateUserTab({
  employeeFullName,
  employeeCode,
  employeeEmail,
  form,
  onChange,
  onApplySuggestion,
  onRegeneratePassword,
}: CreateUserTabProps) {
  const strength = passwordStrength(form.password);

  const updateField = <K extends keyof CreateForm>(
    key: K,
    value: CreateForm[K],
  ) => {
    onChange({ ...form, [key]: value });
  };

  const handleCopyPassword = async () => {
    if (!form.password) return;
    try {
      await navigator.clipboard.writeText(form.password);
    } catch {
      // silent — clipboard blocked
    }
  };

  const hasSuggestion = employeeCode || employeeEmail || employeeFullName;

  return (
    <div className="space-y-4">
      {hasSuggestion && (
        <SuggestionButton
          employeeCode={employeeCode}
          employeeEmail={employeeEmail}
          employeeFullName={employeeFullName}
          onApply={onApplySuggestion}
        />
      )}

      <FieldBlock label="Username" required hint="3–50 ký tự, chữ + số + gạch dưới">
        <InputGroup className="bg-card">
          <InputGroupAddon>
            <UserRound className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="vd: nguyenvana"
            className="text-xs leading-8 md:text-xs"
          />
        </InputGroup>
      </FieldBlock>

      <FieldBlock label="Email" required>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="vd: nguyenvana@landsoft.vn"
        />
      </FieldBlock>

      <div className="grid grid-cols-2 gap-3">
        <FieldBlock label="Tên hiển thị">
          <Input
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder={employeeFullName ?? "Nguyễn Văn A"}
          />
        </FieldBlock>
        <FieldBlock label="Vai trò" required>
          <SelectApp
            options={DEMO_ROLES}
            value={form.roleId}
            onChange={(val) => updateField("roleId", val)}
            placeholder="Chọn vai trò"
          />
        </FieldBlock>
      </div>

      <PasswordBlock
        password={form.password}
        autoGenPassword={form.autoGenPassword}
        forceReset={form.forceReset}
        strength={strength}
        onPasswordChange={(v) => updateField("password", v)}
        onAutoGenChange={(on) =>
          onChange({
            ...form,
            autoGenPassword: on,
            password: on ? generatePassword() : "",
          })
        }
        onForceResetChange={(v) => updateField("forceReset", v)}
        onRegenerate={onRegeneratePassword}
        onCopy={handleCopyPassword}
      />

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Sau khi tạo, hệ thống sẽ <strong>tự động liên kết</strong> tài khoản
          này với nhân viên.
        </span>
      </div>
    </div>
  );
}

// ─── Suggestion "Điền tự động từ nhân viên" ──────────────────────────────────

function SuggestionButton({
  employeeCode,
  employeeEmail,
  employeeFullName,
  onApply,
}: {
  employeeCode: string | null;
  employeeEmail: string | null;
  employeeFullName: string | null;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="flex w-full items-center gap-2 rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary-soft)] px-3 py-2 text-left transition-colors hover:bg-[var(--color-primary-soft)]/70"
    >
      <Sparkles
        aria-hidden
        className="size-4 shrink-0 text-[var(--color-primary-hover)]"
      />
      <div className="min-w-0 flex-1 text-xs text-[var(--color-primary-hover)]">
        <div className="font-medium">Điền tự động từ thông tin nhân viên</div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--color-primary-hover)]/80">
          {employeeCode ? `Username: ${employeeCode.toLowerCase()}` : null}
          {employeeEmail ? ` · Email: ${employeeEmail}` : null}
          {employeeFullName ? ` · Tên: ${employeeFullName}` : null}
        </div>
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-[var(--color-primary-hover)]">
        Áp dụng →
      </span>
    </button>
  );
}

// ─── Password block ──────────────────────────────────────────────────────────

interface PasswordBlockProps {
  password: string;
  autoGenPassword: boolean;
  forceReset: boolean;
  strength: number;
  onPasswordChange: (v: string) => void;
  onAutoGenChange: (on: boolean) => void;
  onForceResetChange: (v: boolean) => void;
  onRegenerate: () => void;
  onCopy: () => void;
}

function PasswordBlock({
  password,
  autoGenPassword,
  forceReset,
  strength,
  onPasswordChange,
  onAutoGenChange,
  onForceResetChange,
  onRegenerate,
  onCopy,
}: PasswordBlockProps) {
  return (
    <div className="rounded-md border border-border bg-muted/25 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">
          Mật khẩu <span className="text-destructive">*</span>
        </Label>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
          <Checkbox
            checked={autoGenPassword}
            onCheckedChange={(v) => onAutoGenChange(v === true)}
          />
          Tự động tạo mật khẩu
        </label>
      </div>

      <div className="relative">
        <InputGroup className="bg-card">
          <InputGroupAddon>
            <KeyRound className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type={autoGenPassword ? "text" : "password"}
            value={password}
            readOnly={autoGenPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số"
            className={cn(
              "pr-16 text-xs leading-8 md:text-xs",
              autoGenPassword && "font-mono",
            )}
          />
          <InputGroupAddon align="inline-end" className="gap-0.5 pr-1">
            {autoGenPassword ? (
              <button
                type="button"
                onClick={onRegenerate}
                className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted"
                title="Tạo lại"
                aria-label="Tạo lại mật khẩu"
              >
                <RefreshCw className="size-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCopy}
              className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted"
              title="Copy"
              aria-label="Copy mật khẩu"
            >
              <Copy className="size-3.5" />
            </button>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <PasswordStrengthBar strength={strength} />

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] text-foreground/80">
        <Checkbox
          checked={forceReset}
          onCheckedChange={(v) => onForceResetChange(v === true)}
          className="mt-0.5"
        />
        <span>Yêu cầu nhân viên đổi mật khẩu ở lần đăng nhập đầu tiên</span>
      </label>
    </div>
  );
}

// ─── Sub: FieldBlock + StrengthBar ───────────────────────────────────────────

function FieldBlock({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? (
        <p className="text-[10.5px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function PasswordStrengthBar({ strength }: { strength: number }) {
  const colors = [
    "bg-muted",
    "bg-[var(--color-danger-default)]",
    "bg-[var(--color-warning-default)]",
    "bg-[var(--color-info-default)]",
    "bg-[var(--color-success-default)]",
  ];
  const labels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              strength >= i ? colors[strength] : "bg-muted",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "w-16 text-right text-[10.5px] font-medium",
          strength >= 3
            ? "text-[var(--color-success-text)]"
            : "text-muted-foreground",
        )}
      >
        {labels[strength]}
      </span>
    </div>
  );
}
