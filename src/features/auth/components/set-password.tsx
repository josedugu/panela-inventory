"use client";

import { useEffect } from "react";
import { InvalidLinkView } from "./InvalidLinkView";
import { SetPasswordFormView } from "./SetPasswordFormView";
import { SuccessView } from "./SuccessView";
import type { AuthStatus, SetPasswordProps } from "./set-password.types";
import { useSetPasswordState } from "./useSetPasswordState";
import { ValidatingView } from "./ValidatingView";

/**
 * Componente orquestador para el flujo de establecer contraseña.
 * Utiliza un hook para la lógica y renderiza la vista correspondiente
 * según el estado del flujo.
 */
export function SetPassword({
  onSuccess,
  onNavigateToSignIn,
}: SetPasswordProps) {
  const { state, handleSubmit } = useSetPasswordState();

  useEffect(() => {
    if (state.status === "SUCCESS") {
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.status, onSuccess]);

  const renderView = (status: AuthStatus) => {
    switch (status) {
      case "VALIDATING":
        return <ValidatingView />;
      case "INVALID_LINK":
        return <InvalidLinkView onNavigateToSignIn={onNavigateToSignIn} />;
      case "READY_TO_SET_PASSWORD":
        return (
          <SetPasswordFormView
            flowType={state.flowType}
            isLoading={false}
            serverError={state.error}
            onSubmit={handleSubmit}
            onNavigateToSignIn={onNavigateToSignIn}
          />
        );
      case "SUBMITTING":
        return (
          <SetPasswordFormView
            flowType={state.flowType}
            isLoading={true}
            serverError={state.error}
            onSubmit={handleSubmit}
            onNavigateToSignIn={onNavigateToSignIn}
          />
        );
      case "SUCCESS":
        return <SuccessView onNavigateToSignIn={onNavigateToSignIn} />;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {renderView(state.status)}
    </div>
  );
}
