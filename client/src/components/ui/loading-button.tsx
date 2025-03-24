import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading,
  loadingText,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "Loading..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}