export const hashPassword = (password: string): string => {
  // Simple hash simulation - in production, use bcrypt or similar
  return btoa(password + 'salt');
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const formatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};