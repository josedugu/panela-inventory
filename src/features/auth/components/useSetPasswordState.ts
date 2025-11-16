"use client";

import { useEffect, useReducer, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthStatus, SetPasswordFormData } from "./set-password.types";

type AuthFlowType = "invite" | "recovery";

interface State {
  status: AuthStatus;
  error: string | null;
  flowType: AuthFlowType | null;
}

type Action =
  | { type: "VALIDATION_SUCCESS"; payload: AuthFlowType }
  | { type: "VALIDATION_FAILURE" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE"; payload: string };

const initialState: State = {
  status: "VALIDATING",
  error: null,
  flowType: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "VALIDATION_SUCCESS":
      return {
        ...state,
        status: "READY_TO_SET_PASSWORD",
        flowType: action.payload,
      };
    case "VALIDATION_FAILURE":
      return { ...state, status: "INVALID_LINK" };
    case "SUBMIT_START":
      return { ...state, status: "SUBMITTING", error: null };
    case "SUBMIT_SUCCESS":
      return { ...state, status: "SUCCESS" };
    case "SUBMIT_FAILURE":
      return {
        ...state,
        status: "READY_TO_SET_PASSWORD",
        error: action.payload,
      };
    default:
      return state;
  }
}

export function useSetPasswordState() {
  const supabase = createClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasValidated = useRef(false);

  useEffect(() => {
    if (hasValidated.current || typeof window === "undefined") return;
    hasValidated.current = true;

    const validateLink = async () => {
      try {
        // Extraer parámetros del hash de la URL
        const hash = window.location.hash.substring(1);
        const hashParams = hash ? new URLSearchParams(hash) : null;
        const accessToken = hashParams?.get("access_token");
        const refreshToken = hashParams?.get("refresh_token");
        const type = hashParams?.get("type");

        // Verificar que tenemos los tokens necesarios y el tipo es válido
        if (
          accessToken &&
          refreshToken &&
          (type === "invite" || type === "recovery")
        ) {
          // Establecer la sesión con los tokens del hash
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error(
              "[set-password] Error setting session:",
              sessionError,
            );
            dispatch({ type: "VALIDATION_FAILURE" });
            return;
          }

          // Verificar que la sesión se estableció correctamente
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            dispatch({ type: "VALIDATION_SUCCESS", payload: type });
            // Limpiar el hash de la URL
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          } else {
            dispatch({ type: "VALIDATION_FAILURE" });
          }
        } else {
          // Si no hay hash con tokens, verificar si ya hay una sesión establecida
          // (por ejemplo, si Supabase ya procesó el hash automáticamente)
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            // Intentar obtener el tipo de los metadatos o del hash
            const typeFromMetadata = session.user?.user_metadata?.flow_type;
            const typeFromHash = hashParams?.get("type");

            const flowType = typeFromMetadata || typeFromHash;
            if (flowType === "invite" || flowType === "recovery") {
              dispatch({ type: "VALIDATION_SUCCESS", payload: flowType });
              // Limpiar el hash de la URL
              window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
            } else {
              dispatch({ type: "VALIDATION_FAILURE" });
            }
          } else {
            dispatch({ type: "VALIDATION_FAILURE" });
          }
        }
      } catch (error) {
        console.error("[set-password] Error validating link:", error);
        dispatch({ type: "VALIDATION_FAILURE" });
      }
    };

    void validateLink();
  }, [supabase]);

  const handleSubmit = async (data: SetPasswordFormData) => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado. Intenta de nuevo.";
      dispatch({ type: "SUBMIT_FAILURE", payload: errorMessage });
    }
  };

  return { state, handleSubmit };
}
