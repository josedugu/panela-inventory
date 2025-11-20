import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

interface SupabaseUserPayload {
  localUserId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  roleId: string;
  roleName?: string | null;
  isActive: boolean;
}

const INVITE_REDIRECT =
  process.env.SUPABASE_INVITE_REDIRECT_URL ??
  (process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/set-password`
    : undefined);

function buildUserMetadata(payload: SupabaseUserPayload) {
  return {
    fullName: payload.fullName,
    phone: payload.phone ?? null,
    localUserId: payload.localUserId,
    isActive: payload.isActive,
  };
}

function buildAppMetadata(payload: SupabaseUserPayload) {
  return {
    roleId: payload.roleId,
    roleName: payload.roleName ?? null,
    localUserId: payload.localUserId,
    isActive: payload.isActive,
    source: "master-data",
  };
}

export async function createSupabaseMasterUser(
  payload: SupabaseUserPayload,
): Promise<{ authUserId: string }> {
  const supabase = getSupabaseAdminClient();
  const userMetadata = buildUserMetadata(payload);

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    payload.email,
    {
      data: userMetadata,
      redirectTo: INVITE_REDIRECT,
    },
  );

  if (error) {
    throw new Error(
      error.message ?? "No se pudo invitar al usuario desde Supabase",
    );
  }

  const authUserId = data.user?.id;
  if (!authUserId) {
    throw new Error("Supabase no retornó el identificador del usuario");
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    authUserId,
    {
      app_metadata: buildAppMetadata(payload),
      user_metadata: userMetadata,
    },
  );

  if (updateError) {
    throw new Error(
      updateError.message ?? "No se pudo guardar el rol en Supabase",
    );
  }

  return { authUserId };
}

export async function updateSupabaseMasterUser(
  authUserId: string,
  payload: SupabaseUserPayload,
) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(authUserId, {
    email: payload.email,
    user_metadata: buildUserMetadata(payload),
    app_metadata: buildAppMetadata(payload),
  });

  if (error) {
    throw new Error(
      error.message ?? "No se pudo actualizar el usuario en Supabase",
    );
  }
}

export async function deleteSupabaseMasterUser(authUserId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(authUserId);

  if (error) {
    throw new Error(
      error.message ?? "No se pudo eliminar el usuario en Supabase",
    );
  }
}

/**
 * Verifica si un usuario en Supabase ya tiene contraseña establecida
 * Un usuario tiene contraseña si tiene email confirmado (email_confirmed_at no es null)
 * Los usuarios invitados que aún no han establecido contraseña tienen email_confirmed_at como null
 */
export async function checkUserHasPassword(
  authUserId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(authUserId);

  if (error || !data.user) {
    return false;
  }

  // Si el usuario tiene email confirmado, significa que ya completó el proceso
  // de establecer contraseña (ya sea por invitación o registro normal)
  const hasPassword = data.user.email_confirmed_at !== null;

  return hasPassword;
}

export async function resendInviteEmail(
  payload: SupabaseUserPayload,
  authUserId?: string | null,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const userMetadata = buildUserMetadata(payload);

  // Si el usuario tiene authUserId, verificar si ya tiene contraseña establecida
  if (authUserId) {
    const hasPassword = await checkUserHasPassword(authUserId);
    if (hasPassword) {
      throw new Error(
        "El usuario ya tiene contraseña establecida. No se puede reenviar la invitación.",
      );
    }
  }

  // inviteUserByEmail puede usarse para reenviar invitaciones a usuarios existentes
  // que aún no han establecido su contraseña. Si el usuario ya tiene contraseña,
  // Supabase no enviará el correo (pero no lanzará error, por eso validamos antes)
  const { error } = await supabase.auth.admin.inviteUserByEmail(payload.email, {
    data: userMetadata,
    redirectTo: INVITE_REDIRECT,
  });

  if (error) {
    throw new Error(
      error.message ?? "No se pudo reenviar la invitación desde Supabase",
    );
  }
}
