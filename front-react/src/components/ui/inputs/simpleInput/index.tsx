import type { UseFormRegisterReturn } from "react-hook-form";
import { AlertIcon, EyeCloseIcon, EyeIcon } from "assets";
import { Label, Input } from "components";
import { useState } from "react";

type SimpleInputProps = {
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  password?: boolean;
  required?: boolean;
  errorText?: string;
  type?: string;
  registration?: UseFormRegisterReturn;
};

export function SimpleInput({
  label,
  placeholder,
  icon,
  password = false,
  required = true,
  errorText,
  type = "text",
  registration,
}: SimpleInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = password ? (showPassword ? "text" : "password") : type;

  const { ref, name, onChange, onBlur } = registration ?? {};

  return (
    <div>
      <Label>
        {label}
        {required ? <span className="text-error-500">*</span> : null}
      </Label>

      <div className="relative">
        <Input
          ref={ref}
          name={name}
          type={inputType}
          className={icon ? "pl-[62px]" : ""}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          error={!!errorText}
        />

        {icon ? (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-2.5 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {icon}
          </span>
        ) : null}

        {password ? (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
            ) : (
              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
            )}
          </button>
        ) : null}
      </div>

      {errorText && (
        <span className="flex items-center gap-1 mt-1.5 text-error-500 text-xs font-medium">
          <AlertIcon className="size-3.5 shrink-0" />
          {errorText}
        </span>
      )}
    </div>
  );
}
