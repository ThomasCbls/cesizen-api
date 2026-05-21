/**
 * DTO pour les recommandations et validation du mot de passe
 * Conforme aux recommandations ANSII
 */
export class PasswordValidationPromptDto {
  title: string = 'Sécurité & Mot de passe'
  description: string =
    'Pour votre sécurité, nous recommandons un mot de passe fort (lettres, chiffres, caractères spéciaux).'

  requirements = {
    minLength: {
      label: 'Au minimum 12 caractères',
      value: 12,
    },
    maxLength: {
      label: 'Maximum 255 caractères',
      value: 255,
    },
    noCommonPasswords: {
      label: 'Pas un mot de passe courant',
    },
    noLeadingTrailingSpaces: {
      label: "Pas d'espaces en début ou fin",
    },
    notEmpty: {
      label: 'Pas un champ vide',
    },
  }

  errorMessages = {
    minLength: 'Le mot de passe doit avoir au minimum 12 caractères',
    maxLength: 'Le mot de passe est trop long (maximum 255 caractères)',
    commonPassword: 'Ce mot de passe est trop commun, veuillez en choisir un autre',
    leadingTrailingSpaces: "Le mot de passe ne doit pas avoir d'espaces en début ou fin",
    empty: 'Le mot de passe ne peut pas être vide',
    notString: 'Le mot de passe doit être une chaîne de caractères',
    invalid: 'Mot de passe invalide',
  }

  tips = [
    'Utilisez une combinaison de lettres majuscules et minuscules',
    'Incluez des chiffres et des caractères spéciaux (@, #, $, %, etc.)',
    "Évitez d'utiliser des informations personnelles (nom, prénom, date de naissance)",
    'Ne réutilisez pas vos mots de passe précédents',
    'Utilisez une phrase facile à retenir: "J\'aime2024maBevoire!" par exemple',
  ]
}

/**
 * DTO pour la réponse de validation du mot de passe
 */
export class PasswordValidationResponseDto {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * DTO pour le changement/création de mot de passe avec prompt
 */
export class PasswordActionDto {
  action: 'create' | 'change'
  title: string
  message: string
  fields: {
    current?: {
      label: string
      placeholder: string
    }
    new: {
      label: string
      placeholder: string
    }
    confirm: {
      label: string
      placeholder: string
    }
  }
  submitButton: string
  cancelButton: string = 'Annuler'

  constructor(action: 'create' | 'change' = 'create') {
    this.action = action

    if (action === 'create') {
      this.title = 'Créer un mot de passe'
      this.message = 'Choisissez un mot de passe fort pour sécuriser votre compte'
      this.submitButton = 'Créer un mot de passe'
      this.fields = {
        new: {
          label: 'Nouveau mot de passe',
          placeholder: 'Entrez votre nouveau mot de passe',
        },
        confirm: {
          label: 'Confirmer le mot de passe',
          placeholder: 'Confirmez votre mot de passe',
        },
      }
    } else {
      this.title = 'Modifier votre mot de passe'
      this.message =
        'Pour des raisons de sécurité, veuillez changer votre mot de passe régulièrement'
      this.submitButton = 'Modifier le mot de passe'
      this.fields = {
        current: {
          label: 'Mot de passe actuel',
          placeholder: 'Entrez votre mot de passe actuel',
        },
        new: {
          label: 'Nouveau mot de passe',
          placeholder: 'Entrez votre nouveau mot de passe',
        },
        confirm: {
          label: 'Confirmer le mot de passe',
          placeholder: 'Confirmez votre nouveau mot de passe',
        },
      }
    }
  }
}
