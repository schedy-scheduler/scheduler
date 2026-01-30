/**
 * Formata um número de telefone brasileiro para o padrão (XX) XXXXX-XXXX
 * @param phone - Número de telefone com ou sem formatação (ex: "19999888668" ou "(19) 99988-8668")
 * @returns Telefone formatado no padrão (XX) XXXXX-XXXX
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";

  // Remove todos os caracteres não numéricos
  const cleanedPhone = phone.replace(/\D/g, "");

  // Valida se tem 11 dígitos (padrão brasileiro)
  if (cleanedPhone.length !== 11) {
    return phone; // Retorna o original se não tiver 11 dígitos
  }

  // Formata: (XX) XXXXX-XXXX
  return cleanedPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

/**
 * Formata um número de telefone enquanto o usuário digita
 * @param phone - Número de telefone parcialmente digitado
 * @returns Telefone parcialmente formatado
 */
export function formatPhoneInput(phone: string): string {
  if (!phone) return "";

  // Remove todos os caracteres não numéricos
  const cleanedPhone = phone.replace(/\D/g, "");

  // Limita a 11 dígitos
  const limited = cleanedPhone.slice(0, 11);

  // Aplica formatação progressiva
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : "";
  }

  if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }

  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}
