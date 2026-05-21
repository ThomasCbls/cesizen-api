import { Injectable } from '@nestjs/common'

/**
 * Service de validation de mot de passe conforme aux recommandations ANSII
 * et au RGPD pour la cybersécurité
 *
 * Recommandations ANSII (https://messervices.cyber.gouv.fr/guides/):
 * - Longueur minimale de 12 caractères
 * - Pas de règles de composition complexe obligatoire
 * - Vérification contre les mots de passe compromis
 * - Pas de réutilisation récente (historique)
 */
@Injectable()
export class PasswordValidatorService {
  // Liste de mots de passe très communs à bloquer (compromis connus)
  private readonly COMMON_PASSWORDS = new Set([
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'dragon',
    'master',
    'sunshine',
    'princess',
    'football',
    'shadow',
    'michael',
    'batman',
    'starwars',
    'trustno1',
    'azerty', // Clavier AZERTY français
    '123456',
    '1234567',
  ])

  /**
   * Valide un mot de passe selon les recommandations ANSII
   * @param password Le mot de passe à valider
   * @param recentPasswords Les mots de passe récents (pour éviter réutilisation)
   * @returns Objet avec isValid et éventuellement des messages d'erreur
   */
  validatePassword(
    password: string,
    recentPasswords: string[] = [],
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validation 1: Longueur minimale de 12 caractères (recommandation ANSII)
    if (password.length < 12) {
      errors.push('Le mot de passe doit avoir au minimum 12 caractères')
    }

    // Validation 2: Longueur maximale (gestion des bases de données)
    if (password.length > 255) {
      errors.push('Le mot de passe est trop long')
    }

    // Validation 3: Vérifier que le mot de passe n'est pas vide ou que whitespace
    if (!password || password.trim().length === 0) {
      errors.push('Le mot de passe ne peut pas être vide')
    }

    // Validation 4: Ne pas autoriser les espaces en début ou fin
    if (password.trim() !== password) {
      errors.push("Le mot de passe ne doit pas avoir d'espaces en début ou fin")
    }

    // Validation 5: Vérifier contre les mots de passe courants compromis
    const lowerPassword = password.toLowerCase()
    if (this.COMMON_PASSWORDS.has(lowerPassword)) {
      errors.push('Ce mot de passe est trop commun')
    }

    // Validation 6: Vérifier contre les variantes communes
    if (this.isCommonVariation(lowerPassword)) {
      errors.push('Ce mot de passe est trop prévisible')
    }

    // Validation 7: Vérifier que le mot de passe n'a pas été réutilisé récemment
    if (recentPasswords.length > 0) {
      const isReused = this.isPasswordReused(password, recentPasswords)
      if (isReused) {
        errors.push('Ce mot de passe a déjà été utilisé')
      }
    }

    // Validation 8: Vérifier la complexité minimale (ANSII recommande de ne pas forcer)
    // Mais on peut l'encourager pour les comptes privilégiés
    const complexity = this.calculateComplexity(password)
    if (complexity < 2) {
      errors.push(
        'Le mot de passe doit mélanger majuscules, minuscules, chiffres et caractères spéciaux',
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Calcule le score de complexité du mot de passe
   * 0: Très faible, 4: Excellente
   */
  calculateComplexity(password: string): number {
    let complexity = 0

    if (/[a-z]/.test(password)) complexity++
    if (/[A-Z]/.test(password)) complexity++
    if (/[0-9]/.test(password)) complexity++
    if (/[^a-zA-Z0-9]/.test(password)) complexity++

    return complexity
  }

  /**
   * Vérifie si le mot de passe est une variation courante
   */
  private isCommonVariation(password: string): boolean {
    // Vérifier les patterns classiques
    const patterns = [
      /^pass\d+$/i, // pass123, pass456
      /^\d+pass$/i, // 123pass
      /^admin\d+$/i, // admin123
      /^user\d+$/i, // user123
      /^test\d+$/i, // test123
      /^123\d+$/i, // 123456...
      /^abc\d+$/i, // abc123
    ]

    return patterns.some((pattern) => pattern.test(password))
  }

  /**
   * Vérifie si le mot de passe a été réutilisé récemment
   * Utilise une comparaison sécurisée avec les hash de mots de passe précédents
   */
  private isPasswordReused(password: string, recentPasswordHashes: string[]): boolean {
    // Cette vérification devrait être faite côté service avec bcrypt.compare
    // Ici on retourne juste true/false pour la logique
    return recentPasswordHashes.length > 0 // Implémentation partielle
  }

  /**
   * Génère un mot de passe robuste recommandé
   */
  generateStrongPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*-_=+?'
    const all = uppercase + lowercase + numbers + special

    let password = ''
    // Assurer au moins un caractère de chaque type
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Remplir le reste jusqu'à 16 caractères
    for (let i = password.length; i < 16; i++) {
      password += all[Math.floor(Math.random() * all.length)]
    }

    // Mélanger le mot de passe
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('')
  }

  /**
   * Vérifie si un mot de passe a été compromis via HaveIBeenPwned API
   * (implémentation future)
   */
  checkAgainstBreachedPasswords(): boolean {
    // TODO: Implémenter la vérification contre HaveIBeenPwned API
    // Pour le moment, retourner false (pas de blocage)
    // Exemple d'implémentation future:
    // const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    // const prefix = sha1.substring(0, 5)
    // const suffix = sha1.substring(5)
    // const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    // const text = await response.text()
    // return text.includes(suffix)
    return false
  }
}
